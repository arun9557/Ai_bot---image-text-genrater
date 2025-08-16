// Main Application Class
class AIAssistantApp {
    constructor() {
        // Initialize state
        this.state = {
            isProcessing: false,
            currentImageUrl: null,
            generationHistory: [],
            activeTab: 'chat',
            currentSeed: Math.floor(Math.random() * 1000000)
        };

        // Cache DOM elements
        this.elements = this.cacheElements();
        
        // Initialize the app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    // Cache all DOM elements
    cacheElements() {
        return {
            // Tabs
            chatTab: document.getElementById('chatTab'),
            imageTab: document.getElementById('imageTab'),
            chatTabContent: document.getElementById('chatTabContent'),
            imageTabContent: document.getElementById('imageTabContent'),
            tabIndicator: document.querySelector('.tab-indicator'),
            
            // Image Generation
            generateButton: document.getElementById('generateButton'),
            promptInput: document.getElementById('promptInput'),
            widthInput: document.getElementById('widthInput'),
            heightInput: document.getElementById('heightInput'),
            seedInput: document.getElementById('seedInput'),
            randomizeSeed: document.getElementById('randomizeSeed'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            imageContainer: document.getElementById('imageContainer'),
            generatedImage: document.getElementById('generatedImage'),
            imageActions: document.getElementById('imageActions'),
            downloadButton: document.getElementById('downloadButton'),
            shareButton: document.getElementById('shareButton'),
            historyGrid: document.getElementById('historyGrid'),
            
            // Chat
            chatWindow: document.getElementById('chatWindow'),
            userInput: document.getElementById('userInput'),
            sendButton: document.getElementById('sendButton'),
            micButton: document.getElementById('micButton')
        };
    }

    // Initialize app components
    initializeApp() {
        this.loadHistory();
        this.setupEventListeners();
        this.setupTabIndicator();
        this.setupCharCounter();
        this.showWelcomeMessage();
        this.updateSeedInput();
    }

    // Load generation history from localStorage
    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('generationHistory');
            if (savedHistory) {
                this.state.generationHistory = JSON.parse(savedHistory);
                this.updateHistoryDisplay();
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.state.generationHistory = [];
            localStorage.removeItem('generationHistory');
        }
    }

    // Set up all event listeners
    setupEventListeners() {
        // Tab switching
        if (this.elements.chatTab) {
            this.elements.chatTab.addEventListener('click', () => this.switchTab('chat'));
        }
        if (this.elements.imageTab) {
            this.elements.imageTab.addEventListener('click', () => this.switchTab('image'));
        }
        
        // Chat functionality
        if (this.elements.sendButton) {
            this.elements.sendButton.addEventListener('click', () => this.handleSendMessage());
        }
        if (this.elements.userInput) {
            this.elements.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }
        
        // Image generation
        if (this.elements.generateButton) {
            this.elements.generateButton.addEventListener('click', () => this.generateImage());
        }
        if (this.elements.downloadButton) {
            this.elements.downloadButton.addEventListener('click', () => this.downloadImage());
        }
        if (this.elements.shareButton) {
            this.elements.shareButton.addEventListener('click', () => this.shareImage());
        }
        if (this.elements.randomizeSeed) {
            this.elements.randomizeSeed.addEventListener('click', (e) => {
                e.preventDefault();
                this.state.currentSeed = Math.floor(Math.random() * 1000000);
                this.updateSeedInput();
            });
        }
        
        // Character counter for prompt input
        if (this.elements.promptInput) {
            this.elements.promptInput.addEventListener('input', () => this.updateCharCounter());
        }
    }

    // Set up tab indicator position
    setupTabIndicator() {
        if (!this.elements.tabIndicator) return;
        
        const activeTab = this.elements[`${this.state.activeTab}Tab`];
        if (activeTab) {
            const tabRect = activeTab.getBoundingClientRect();
            const containerRect = activeTab.parentElement.getBoundingClientRect();
            this.elements.tabIndicator.style.width = `${tabRect.width}px`;
            this.elements.tabIndicator.style.transform = `translateX(${tabRect.left - containerRect.left}px)`;
        }
    }

    // Update character counter for prompt input
    updateCharCounter() {
        if (!this.elements.promptInput) return;
        
        const charCount = this.elements.promptInput.value.length;
        const charCountElement = document.getElementById('charCount');
        if (charCountElement) {
            charCountElement.textContent = charCount;
            if (charCount > 500) {
                charCountElement.classList.add('text-red-500');
            } else {
                charCountElement.classList.remove('text-red-500');
            }
        }
    }

    // Update seed input with current seed
    updateSeedInput() {
        if (this.elements.seedInput) {
            this.elements.seedInput.value = this.state.currentSeed;
        }
    }

    // Show welcome message in chat
    showWelcomeMessage() {
        if (!this.elements.chatWindow) return;
        
        const welcomeMessages = [
            "👋 Hello! I'm your AI assistant. How can I help you today?",
            "💡 You can chat with me or generate images using the tabs above.",
            "🎨 Try asking me something or switch to the Image Generation tab to create AI art!"
        ];
        
        welcomeMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.addMessage(msg, false);
            }, index * 800);
        });
    }

    // Switch between chat and image tabs
    switchTab(tabName) {
        if (this.state.activeTab === tabName || !this.elements[`${tabName}Tab`] || !this.elements[`${tabName}TabContent`]) {
            return;
        }
        
        // Update active tab state
        this.state.activeTab = tabName;
        
        // Update tab buttons
        if (this.elements.chatTab) this.elements.chatTab.classList.remove('active');
        if (this.elements.imageTab) this.elements.imageTab.classList.remove('active');
        this.elements[`${tabName}Tab`].classList.add('active');
        
        // Update tab content
        if (this.elements.chatTabContent) this.elements.chatTabContent.classList.add('hidden');
        if (this.elements.imageTabContent) this.elements.imageTabContent.classList.add('hidden');
        this.elements[`${tabName}TabContent`].classList.remove('hidden');
        
        // Update tab indicator position
        this.setupTabIndicator();
    }

    // Add a message to the chat window with smooth animation
    addMessage(message, isUser = false) {
        if (!message || !this.elements.chatWindow) return null;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        // Simple XSS protection
        const textNode = document.createTextNode(message);
        messageDiv.appendChild(textNode);
        
        this.elements.chatWindow.appendChild(messageDiv);
        
        // Auto-scroll to bottom with smooth behavior
        this.elements.chatWindow.scrollTo({
            top: this.elements.chatWindow.scrollHeight,
            behavior: 'smooth'
        });
        
        return messageDiv;
    }

    // Handle sending chat messages
    async handleSendMessage() {
        if (!this.elements.userInput || !this.elements.sendButton || !this.elements.chatWindow) {
            return;
        }

        const message = this.elements.userInput.value.trim();
        if (!message || this.state.isProcessing) return;

        // Set processing state
        this.state.isProcessing = true;
        this.elements.sendButton.disabled = true;
        this.elements.userInput.disabled = true;
        
        // Add user message to chat
        this.addMessage(message, true);
        this.elements.userInput.value = '';
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        this.elements.chatWindow.appendChild(typingIndicator);
        
        try {
            // Get bot response
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            // Remove typing indicator
            typingIndicator.remove();
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || `Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Add bot response with typing effect
            if (data.response) {
                const responseDiv = this.addMessage('', false);
                const text = data.response;
                let i = 0;
                const speed = 20; // ms per character
                
                const typeWriter = () => {
                    if (i < text.length && responseDiv) {
                        responseDiv.textContent = text.substring(0, i + 1);
                        i++;
                        setTimeout(typeWriter, speed);
                        
                        // Auto-scroll while typing
                        if (this.elements.chatWindow) {
                            this.elements.chatWindow.scrollTop = this.elements.chatWindow.scrollHeight;
                        }
                    }
                };
                
                typeWriter();
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage(`❌ ${error.message || 'An error occurred. Please try again.'}`, false);
        } finally {
            // Reset UI state
            this.state.isProcessing = false;
            if (this.elements.sendButton) this.elements.sendButton.disabled = false;
            if (this.elements.userInput) {
                this.elements.userInput.disabled = false;
                this.elements.userInput.focus();
            }
        }
    }

    // Generate an AI image based on user input
    async generateImage() {
        const prompt = this.elements.promptInput.value.trim();
        if (!prompt || this.state.isProcessing) return;

        // Get and validate input values
        let width, height, seed;
        try {
            width = Math.min(Math.max(256, parseInt(this.elements.widthInput.value) || 512), 1024);
            height = Math.min(Math.max(256, parseInt(this.elements.heightInput.value) || 512), 1024);
            seed = this.elements.seedInput.value ? parseInt(this.elements.seedInput.value) : Math.floor(Math.random() * 1000000);
            
            // Update inputs with validated values
            this.elements.widthInput.value = width;
            this.elements.heightInput.value = height;
            this.elements.seedInput.value = seed;
        } catch (error) {
            console.error('Invalid input values:', error);
            this.showError('Please enter valid numbers for width, height, and seed.');
            return;
        }
        
        // Update UI for loading state
        this.setLoadingState(true);
        
        try {
            // Show loading state
            this.elements.imageContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg p-6">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-600 font-medium">Creating your image...</p>
                    <p class="text-sm text-gray-500 mt-2">This may take a moment</p>
                </div>
            `;
            
            // Call the image generation API
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    width: width,
                    height: height,
                    seed: seed
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate image');
            }
            
            // Get the image blob and create URL
            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) {
                throw new Error('Invalid image received from server');
            }
            
            // Create object URL for the image
            const imageUrl = URL.createObjectURL(blob);
            this.state.currentImageUrl = imageUrl;
            
            // Display the generated image
            this.elements.imageContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = prompt;
            img.className = 'w-full h-auto rounded-xl shadow-lg';
            this.elements.imageContainer.appendChild(img);
            
            // Show action buttons
            this.elements.imageActions.classList.remove('hidden');
            
            // Add to history
            const historyItem = {
                id: Date.now(),
                prompt: prompt,
                width: width,
                height: height,
                seed: seed,
                timestamp: new Date().toISOString(),
                imageUrl: imageUrl
            };
            
            this.addToHistory(historyItem);
            this.showToast('Image generated successfully!', 'success');
            
        } catch (error) {
            console.error('Image generation error:', error);
            this.showError(`Failed to generate image: ${error.message || 'Please try again'}`);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    // Set loading state for image generation
    setLoadingState(isLoading) {
        this.state.isProcessing = isLoading;
        
        if (this.elements.generateButton) {
            this.elements.generateButton.disabled = isLoading;
            
            // Update button text
            if (isLoading) {
                const originalText = this.elements.generateButton.innerHTML;
                this.elements.generateButton.dataset.originalText = originalText;
                this.elements.generateButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';
            } else {
                const originalText = this.elements.generateButton.dataset.originalText || 
                                   '<i class="fas fa-magic mr-2"></i> Generate Image';
                this.elements.generateButton.innerHTML = originalText;
            }
        }
        
        // Toggle loading indicator
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.classList.toggle('hidden', !isLoading);
        }
    }
    
    // Show error message in the image container
    showError(message) {
        if (!this.elements.imageContainer) return;
        
        this.elements.imageContainer.innerHTML = `
            <div class="text-center p-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <button 
                    onclick="app.generateImage()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <i class="fas fa-redo mr-2"></i> Try Again
                </button>
            </div>
        `;
    }
    
    // Show a toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
        } transform translate-y-2 opacity-0 transition-all duration-300 z-50`;
        
        // Add icon based on type
        let icon = '';
        if (type === 'success') icon = '<i class="fas fa-check-circle mr-2"></i>';
        else if (type === 'error') icon = '<i class="fas fa-exclamation-circle mr-2"></i>';
        else icon = '<i class="fas fa-info-circle mr-2"></i>';
        
        toast.innerHTML = `${icon}${message}`;
        
        document.body.appendChild(toast);
        
        // Trigger reflow to enable animation
        void toast.offsetWidth;
        
        // Show toast
        toast.classList.remove('opacity-0', 'translate-y-2');
        toast.classList.add('opacity-100');
        
        // Auto-hide after delay
        setTimeout(() => {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0', 'translate-y-2');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Add an image to the history
    addToHistory(historyItem) {
        this.state.generationHistory.unshift(historyItem);
        this.updateHistoryDisplay();
        
        // Save to localStorage
        try {
            localStorage.setItem('generationHistory', JSON.stringify(this.state.generationHistory));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }
    
    // Update the history display
    updateHistoryDisplay() {
        if (!this.elements.historyGrid) return;
        
        // Clear existing history items
        this.elements.historyGrid.innerHTML = '';
        
        // Add each history item to the grid
        this.state.generationHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'relative group rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow';
            historyItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.prompt}" class="w-full h-32 object-cover">
                <div class="p-3">
                    <p class="text-sm text-gray-600 truncate" title="${item.prompt}">${item.prompt}</p>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-xs text-gray-500">${item.width}×${item.height}</span>
                        <div class="flex space-x-1">
                            <button onclick="app.loadHistoryItem(${item.id})" class="p-1 text-gray-500 hover:text-blue-600">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="app.downloadImage('${item.imageUrl}')" class="p-1 text-gray-500 hover:text-green-600">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            this.elements.historyGrid.appendChild(historyItem);
        });
    }
    
    // Load a history item
    loadHistoryItem(id) {
        const item = this.state.generationHistory.find(item => item.id === id);
        if (!item) return;
        
        // Switch to image tab
        this.switchTab('image');
        
        // Set the current image
        this.state.currentImageUrl = item.imageUrl;
        this.elements.promptInput.value = item.prompt;
        this.elements.widthInput.value = item.width;
        this.elements.heightInput.value = item.height;
        this.elements.seedInput.value = item.seed;
        
        // Display the image
        this.elements.imageContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = item.imageUrl;
        img.alt = item.prompt;
        img.className = 'w-full h-auto rounded-xl shadow-lg';
        this.elements.imageContainer.appendChild(img);
        
        // Show action buttons
        this.elements.imageActions.classList.remove('hidden');
    }
    
    // Download the current image
    async downloadImage(imageUrl = null) {
        const url = imageUrl || this.state.currentImageUrl;
        if (!url) return;
        
        try {
            // Create a temporary link
            const link = document.createElement('a');
            link.href = url;
            
            // Set the download attribute with a filename
            const prompt = this.elements.promptInput.value.trim().substring(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase();
            link.download = `ai-image-${prompt || 'generated'}.png`;
            
            // Trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            this.showToast('Image downloaded!', 'success');
            
        } catch (error) {
            console.error('Error downloading image:', error);
            this.showToast('Failed to download image', 'error');
        }
    }
    
    // Share the current image
    async shareImage() {
        if (!this.state.currentImageUrl) return;
        
        try {
            // Show loading state on share button
            const shareButton = this.elements.shareButton;
            const originalText = shareButton.innerHTML;
            shareButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Preparing...';
            shareButton.disabled = true;
            
            // Fetch the image as blob
            const response = await fetch(this.state.currentImageUrl);
            if (!response.ok) throw new Error('Failed to load image for sharing');
            
            const blob = await response.blob();
            const file = new File(
                [blob], 
                `ai-image-${this.elements.promptInput.value.trim().substring(0, 20).replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'generated'}.png`, 
                { type: 'image/png' }
            );
            
            // Check if Web Share API is available
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'AI Generated Image',
                    text: this.elements.promptInput.value.trim() || 'Check out this AI-generated image!',
                    files: [file],
                    url: window.location.href
                });
            } 
            // Fallback for browsers that support Web Share API but not file sharing
            else if (navigator.share) {
                await navigator.share({
                    title: 'AI Generated Image',
                    text: this.elements.promptInput.value.trim() || 'Check out this AI-generated image!',
                    url: this.state.currentImageUrl
                });
            } 
            // Fallback for browsers that don't support Web Share API
            else {
                // Copy the image URL to clipboard
                await navigator.clipboard.writeText(this.state.currentImageUrl);
                this.showToast('Image URL copied to clipboard!', 'info');
            }
            
        } catch (error) {
            console.error('Error sharing image:', error);
            
            // If sharing was aborted by the user, don't show an error
            if (error.name !== 'AbortError') {
                this.showToast('Failed to share image. You can still download it.', 'error');
            }
            
        } finally {
            // Reset share button state
            if (this.elements.shareButton) {
                this.elements.shareButton.innerHTML = originalText || '<i class="fas fa-share-alt mr-2"></i> Share';
                this.elements.shareButton.disabled = false;
            }
        }
    }
}

// Initialize the application when the script loads
window.app = new AIAssistantApp();
