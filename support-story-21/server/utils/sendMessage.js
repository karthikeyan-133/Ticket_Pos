import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract Client and LocalAuth from the default export
const { Client, LocalAuth } = pkg;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create WhatsApp client with persistent session and better configuration
let client = null;
let isClientReady = false;
let isInitializing = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// Function to create a new client instance with better error handling
const createClient = () => {
  // Define session directory
  const sessionDir = path.join(__dirname, '..', '.wwebjs_auth');
  
  // Ensure session directory exists
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  
  return new Client({
    authStrategy: new LocalAuth({
      clientId: 'ticket-system',
      dataPath: sessionDir
    }),
    puppeteer: {
      headless: true, // Run in headless mode for stability
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials'
      ],
      // Add timeout to prevent hanging
      timeout: 60000
    },
    webVersion: "2.2412.54v2", // Use a specific, stable web version
    webVersionCacheDir: path.join(__dirname, '..', '.wwebjs_cache') // Cache directory
  });
};

// Function to safely remove locked files with retry logic
const safeRemoveFile = async (filePath, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully removed file: ${filePath}`);
        return true;
      }
      return true; // File doesn't exist, nothing to remove
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed to remove ${filePath}: ${error.message}`);
      if (i < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        console.error(`Failed to remove ${filePath} after ${maxRetries} attempts`);
        return false;
      }
    }
  }
};

// Function to clean up locked session files
const cleanupSessionFiles = async () => {
  try {
    const sessionDir = path.join(__dirname, '..', '.wwebjs_auth', 'session');
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);
      for (const file of files) {
        const filePath = path.join(sessionDir, file);
        // Skip directories, only handle files
        if (fs.statSync(filePath).isFile()) {
          await safeRemoveFile(filePath);
        }
      }
    }
  } catch (error) {
    console.warn('Error during session cleanup:', error.message);
  }
};

// Initialize client with better error handling
const initializeClient = async () => {
  if (isInitializing) {
    console.log('WhatsApp client is already initializing...');
    return;
  }
  
  isInitializing = true;
  
  try {
    // Try to clean up any locked files before initialization
    await cleanupSessionFiles();
    
    // Create new client instance
    client = createClient();
    
    // Attach event listeners
    client.on('qr', qr => {
      console.log('Scan this QR code with your WhatsApp app:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      isClientReady = true;
      isInitializing = false;
      retryCount = 0; // Reset retry count on successful connection
      
      // Log available chats for debugging
      setTimeout(async () => {
        try {
          const chats = await client.getChats();
          const groups = chats.filter(chat => chat.isGroup);
          console.log('Available WhatsApp groups:');
          groups.forEach(group => {
            console.log(`- ${group.name} (ID: ${group.id._serialized})`);
          });
          if (groups.length === 0) {
            console.log('No groups found. Please create a group and add this WhatsApp account to it.');
          }
        } catch (error) {
          console.error('Error fetching chats:', error.message);
        }
      }, 5000);
    });

    client.on('authenticated', () => {
      console.log('WhatsApp client authenticated!');
    });

    client.on('auth_failure', msg => {
      console.error('WhatsApp authentication failed:', msg);
      isInitializing = false;
      
      // Retry initialization if retries are available
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying WhatsApp initialization (${retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => {
          initializeClient();
        }, 5000);
      } else {
        console.error('Max retries reached. WhatsApp initialization failed.');
      }
    });

    client.on('disconnected', reason => {
      console.log('WhatsApp client disconnected:', reason);
      isClientReady = false;
      isInitializing = false;
      
      // Try to reinitialize the client
      console.log('Attempting to reinitialize WhatsApp client...');
      setTimeout(() => {
        initializeClient();
      }, 5000);
    });
    
    client.on('change_state', state => {
      console.log('WhatsApp client state changed:', state);
    });
    
    client.on('loading_screen', (percent, message) => {
      console.log('WhatsApp loading:', percent, message);
    });

    // Start the client
    await client.initialize();
    console.log('WhatsApp client initialization started...');
  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
    isInitializing = false;
    
    // Handle specific file locking errors
    if (error.message.includes('EBUSY') || error.message.includes('resource busy')) {
      console.log('File locking issue detected. Attempting cleanup...');
      await cleanupSessionFiles();
      
      // Retry initialization if retries are available
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying WhatsApp initialization (${retryCount}/${MAX_RETRIES}) after cleanup...`);
        setTimeout(() => {
          initializeClient();
        }, 5000);
      } else {
        console.error('Max retries reached. WhatsApp initialization failed.');
      }
    } else {
      // Retry initialization if retries are available
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying WhatsApp initialization (${retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => {
          initializeClient();
        }, 5000);
      } else {
        console.error('Max retries reached. WhatsApp initialization failed.');
      }
    }
  }
};

// Initialize the client
initializeClient().catch(error => {
  console.error('Failed to initialize WhatsApp client:', error);
});

// Function to wait for client to be ready
const waitForClientReady = async (timeout = 30000) => {
  const startTime = Date.now();
  while (!isClientReady && (Date.now() - startTime) < timeout) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return isClientReady;
};

// Function to send message to a phone number with retry logic
const sendToNumber = async (number, message) => {
  try {
    // Wait for client to be ready
    if (!isClientReady) {
      console.log('Waiting for WhatsApp client to be ready...');
      const clientReady = await waitForClientReady();
      if (!clientReady) {
        throw new Error('WhatsApp client is not ready after waiting');
      }
    }
    
    // Format the number for WhatsApp (remove any non-digit characters and add country code if needed)
    let formattedNumber = number.replace(/\D/g, '');
    
    // Add country code if not present (assuming UAE numbers)
    if (formattedNumber.startsWith('05') && formattedNumber.length === 10) {
      formattedNumber = `971${formattedNumber.substring(1)}`;
    } else if (formattedNumber.length === 9 && formattedNumber.startsWith('5')) {
      formattedNumber = `971${formattedNumber}`;
    } else if (formattedNumber.length === 10) {
      formattedNumber = `971${formattedNumber}`;
    }
    
    // Add @c.us suffix required by whatsapp-web.js
    const chatId = `${formattedNumber}@c.us`;
    
    console.log(`Sending message to ${chatId}: ${message}`);
    
    // Send the message with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await client.sendMessage(chatId, message);
        
        // Log the message
        logMessage({
          to: chatId,
          message: message,
          timestamp: new Date().toISOString(),
          success: true,
          messageId: result.id._serialized
        });
        
        return { success: true, result };
      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, error.message);
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error('Error sending message to number:', error);
    
    // Log the error
    logMessage({
      to: number,
      message: message,
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message
    });
    
    return { success: false, error: error.message };
  }
};

// Function to send message to a group by name or ID
const sendToGroup = async (groupIdentifier, message) => {
  try {
    // Wait for client to be ready
    if (!isClientReady) {
      console.log('Waiting for WhatsApp client to be ready...');
      const clientReady = await waitForClientReady();
      if (!clientReady) {
        throw new Error('WhatsApp client is not ready after waiting');
      }
    }
    
    console.log(`Sending message to group: "${groupIdentifier}"`);
    
    // Check if the identifier is a group ID (contains @g.us)
    if (groupIdentifier.includes('@g.us')) {
      console.log(`Using group ID directly: ${groupIdentifier}`);
      
      // Send the message directly to the group ID
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const result = await client.sendMessage(groupIdentifier, message);
          
          // Log the message
          logMessage({
            to: groupIdentifier,
            message: message,
            timestamp: new Date().toISOString(),
            success: true,
            messageId: result.id._serialized
          });
          
          return { success: true, result };
        } catch (error) {
          attempts++;
          console.error(`Attempt ${attempts} failed:`, error.message);
          
          if (attempts >= maxAttempts) {
            throw error;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } else {
      // Treat as group name and find the group
      console.log(`Looking for group by name: "${groupIdentifier}"`);
      
      // Get all chats with retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let chats;
      
      while (attempts < maxAttempts) {
        try {
          chats = await client.getChats();
          break;
        } catch (error) {
          attempts++;
          console.error(`Attempt ${attempts} to get chats failed:`, error.message);
          
          if (attempts >= maxAttempts) {
            throw error;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // List all available groups for debugging
      const groups = chats.filter(chat => chat.isGroup);
      console.log('Available groups:');
      groups.forEach(group => {
        console.log(`- "${group.name}" (ID: ${group.id._serialized})`);
      });
      
      // Find the group chat by name (case-insensitive partial match)
      const groupChat = groups.find(chat => 
        chat.name.toLowerCase().includes(groupIdentifier.toLowerCase()) || 
        groupIdentifier.toLowerCase().includes(chat.name.toLowerCase())
      );
      
      // If exact match not found, try partial match
      if (!groupChat) {
        console.log(`Exact group "${groupIdentifier}" not found. Looking for partial matches...`);
        const partialMatch = groups.find(chat => 
          chat.name.toLowerCase().includes(groupIdentifier.toLowerCase().substring(0, 3)) ||
          chat.name.toLowerCase().replace(/\s+/g, '').includes(groupIdentifier.toLowerCase().replace(/\s+/g, ''))
        );
        
        if (partialMatch) {
          console.log(`Found partial match: "${partialMatch.name}"`);
        } else {
          const error = `Group "${groupIdentifier}" not found. Available groups: ${groups.map(g => `"${g.name}"`).join(', ')}`;
          console.error(error);
          
          // Log the error
          logMessage({
            to: groupIdentifier,
            message: message,
            timestamp: new Date().toISOString(),
            success: false,
            error: error
          });
          
          return { success: false, error };
        }
      } else {
        console.log(`Found exact match: "${groupChat.name}"`);
      }
      
      const targetGroup = groupChat || partialMatch;
      
      console.log(`Sending message to group ${targetGroup.name}: ${message}`);
      
      // Send the message to the group with retry logic
      attempts = 0;
      while (attempts < maxAttempts) {
        try {
          const result = await client.sendMessage(targetGroup.id._serialized, message);
          
          // Log the message
          logMessage({
            to: targetGroup.name,
            message: message,
            timestamp: new Date().toISOString(),
            success: true,
            messageId: result.id._serialized
          });
          
          return { success: true, result };
        } catch (error) {
          attempts++;
          console.error(`Attempt ${attempts} failed:`, error.message);
          
          if (attempts >= maxAttempts) {
            throw error;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  } catch (error) {
    console.error('Error sending message to group:', error);
    
    // Log the error
    logMessage({
      to: groupIdentifier,
      message: message,
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message
    });
    
    return { success: false, error: error.message };
  }
};

// Function to log messages to file
const logMessage = (messageData) => {
  try {
    const logFile = path.join(logsDir, 'messages.json');
    
    // Read existing logs
    let logs = [];
    if (fs.existsSync(logFile)) {
      const data = fs.readFileSync(logFile, 'utf8');
      logs = JSON.parse(data || '[]');
    }
    
    // Add new log entry
    logs.push(messageData);
    
    // Write back to file
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error logging message:', error);
  }
};

// Export both functions for backward compatibility
export { sendToNumber, sendToGroup as sendToGroupByName, sendToGroup, client, isClientReady };