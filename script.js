// LinkerLab - Multi-Platform Social Media Manager
// Interactive JavaScript functionality

class LinkerLab {
    constructor() {
        this.selectedPlatforms = new Set(['pinterest', 'facebook']);
        this.uploadedImages = [];
        this.currentContent = '';
        this.geminiApiKey = 'YOUR_GEMINI_API_KEY'; // Replace with actual API key
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePlatformSelection();
        this.initializeImageUpload();
        this.initializeContentEditor();
        this.initializePreviewTabs();
        this.initializeAIFeatures();
        this.initializeDemoData();
    }

    setupEventListeners() {
        // Navigation smooth scrolling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Get Started button
        document.getElementById('getStartedBtn').addEventListener('click', () => {
            document.querySelector('.content-creation').scrollIntoView({ behavior: 'smooth' });
        });

        // Publish button
        document.getElementById('publishBtn').addEventListener('click', () => {
            this.handlePublish();
        });

        // Save draft button
        document.querySelector('.btn-outline').addEventListener('click', () => {
            this.handleSaveDraft();
        });

        // Schedule post button
        document.querySelector('.btn-secondary').addEventListener('click', () => {
            this.handleSchedulePost();
        });
    }

    initializePlatformSelection() {
        const platformOptions = document.querySelectorAll('.platform-option input[type="checkbox"]');
        
        platformOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                const platform = e.target.value;
                if (e.target.checked) {
                    this.selectedPlatforms.add(platform);
                } else {
                    this.selectedPlatforms.delete(platform);
                }
                this.updatePlatformSelection();
                this.updatePreviewTabs();
                this.updatePreview();
            });
        });

        // Platform cards hover effects
        document.querySelectorAll('.platform-card').forEach(card => {
            card.addEventListener('click', () => {
                const platform = card.dataset.platform;
                const checkbox = document.querySelector(`input[value="${platform}"]`);
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    updatePlatformSelection() {
        const selectedCount = this.selectedPlatforms.size;
        const publishBtn = document.getElementById('publishBtn');
        
        if (selectedCount === 0) {
            publishBtn.disabled = true;
            publishBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Select Platforms First';
        } else {
            publishBtn.disabled = false;
            publishBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Publish to ${selectedCount} Platform${selectedCount > 1 ? 's' : ''}`;
        }
    }

    initializeImageUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const imagePreview = document.getElementById('imagePreview');

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleImageUpload(files);
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleImageUpload(files);
        });
    }

    handleImageUpload(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        file: file,
                        url: e.target.result,
                        name: file.name
                    };
                    this.uploadedImages.push(imageData);
                    this.updateImagePreview();
                    this.updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateImagePreview() {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = '';

        this.uploadedImages.forEach(image => {
            const imageElement = document.createElement('div');
            imageElement.className = 'image-item';
            imageElement.innerHTML = `
                <img src="${image.url}" alt="${image.name}">
                <button class="remove-image" data-id="${image.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            imagePreview.appendChild(imageElement);
        });

        // Add remove functionality
        imagePreview.querySelectorAll('.remove-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const imageId = e.target.closest('.remove-image').dataset.id;
                this.removeImage(imageId);
            });
        });
    }

    removeImage(imageId) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id != imageId);
        this.updateImagePreview();
        this.updatePreview();
    }

    initializeContentEditor() {
        const textarea = document.getElementById('contentTextarea');
        const charCount = document.getElementById('charCount');

        textarea.addEventListener('input', (e) => {
            this.currentContent = e.target.value;
            charCount.textContent = e.target.value.length;
            
            // Update character count color based on length
            if (e.target.value.length > 250) {
                charCount.style.color = 'var(--error-color)';
            } else if (e.target.value.length > 200) {
                charCount.style.color = 'var(--warning-color)';
            } else {
                charCount.style.color = 'var(--gray-500)';
            }

            this.updatePreview();
        });

        // Editor toolbar functionality
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleEditorAction(action);
            });
        });
    }

    handleEditorAction(action) {
        const textarea = document.getElementById('contentTextarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        switch (action) {
            case 'bold':
                this.wrapText(textarea, '**', '**', start, end);
                break;
            case 'italic':
                this.wrapText(textarea, '*', '*', start, end);
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    this.wrapText(textarea, `[${selectedText || 'link'}](${url})`, '', start, end);
                }
                break;
            case 'emoji':
                this.insertEmoji(textarea);
                break;
        }
    }

    wrapText(textarea, prefix, suffix, start, end) {
        const selectedText = textarea.value.substring(start, end);
        const newText = prefix + selectedText + suffix;
        textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        this.currentContent = textarea.value;
        this.updatePreview();
    }

    insertEmoji(textarea) {
        const emojis = ['😊', '🚀', '💡', '🎉', '🔥', '⭐', '💪', '🎯', '✨', '🌟'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const start = textarea.selectionStart;
        textarea.value = textarea.value.substring(0, start) + randomEmoji + textarea.value.substring(start);
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
        this.currentContent = textarea.value;
        this.updatePreview();
    }

    initializePreviewTabs() {
        // Initialize with default selected platforms
        this.updatePreviewTabs();
    }

    updatePreviewTabs() {
        const previewTabsContainer = document.getElementById('previewTabs');
        previewTabsContainer.innerHTML = '';

        // Create tabs for selected platforms only
        this.selectedPlatforms.forEach((platform, index) => {
            const tab = document.createElement('button');
            tab.className = `preview-tab ${index === 0 ? 'active' : ''}`;
            tab.dataset.platform = platform;
            tab.textContent = this.getPlatformDisplayName(platform);
            
            tab.addEventListener('click', (e) => {
                this.switchPreviewTab(platform);
            });
            
            previewTabsContainer.appendChild(tab);
        });

        // Update preview for the first selected platform
        if (this.selectedPlatforms.size > 0) {
            const firstPlatform = Array.from(this.selectedPlatforms)[0];
            this.updatePreview(firstPlatform);
        }
    }

    getPlatformDisplayName(platform) {
        const platformNames = {
            'pinterest': 'Pinterest',
            'facebook': 'Facebook',
            'instagram': 'Instagram',
            'etsy': 'Etsy',
            'blogger': 'Blogger',
            'youtube': 'YouTube'
        };
        return platformNames[platform] || platform;
    }

    switchPreviewTab(platform) {
        // Update active tab
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-platform="${platform}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update preview content based on platform
        this.updatePreview(platform);
    }

    updatePreview(platform = 'pinterest') {
        const previewText = document.getElementById('previewText');
        const previewImage = document.getElementById('previewImage');
        
        // Update text content
        if (this.currentContent) {
            previewText.textContent = this.currentContent;
        } else {
            previewText.textContent = 'Your post content will appear here...';
        }

        // Update image preview
        if (this.uploadedImages.length > 0) {
            previewImage.style.backgroundImage = `url(${this.uploadedImages[0].url})`;
            previewImage.style.backgroundSize = 'cover';
            previewImage.style.backgroundPosition = 'center';
            previewImage.textContent = '';
        } else {
            previewImage.style.backgroundImage = '';
            previewImage.textContent = 'No image selected';
        }

        // Platform-specific styling
        this.applyPlatformStyling(platform);
    }

    applyPlatformStyling(platform) {
        const previewCard = document.getElementById('previewCard');
        
        // Remove existing platform classes
        previewCard.classList.remove('pinterest-style', 'facebook-style', 'instagram-style', 'etsy-style', 'blogger-style', 'youtube-style');
        
        // Add platform-specific styling
        previewCard.classList.add(`${platform}-style`);
    }

    initializeAIFeatures() {
        const aiSuggestBtn = document.getElementById('aiSuggest');
        const aiStatus = document.getElementById('aiStatus');

        aiSuggestBtn.addEventListener('click', () => {
            this.generateAIContent();
        });
    }

    async generateAIContent() {
        const aiStatus = document.getElementById('aiStatus');
        const textarea = document.getElementById('contentTextarea');
        
        // Show loading state
        aiStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI Thinking...';
        aiStatus.style.color = 'var(--warning-color)';

        try {
            // Simulate AI content generation (replace with actual Gemini API call)
            const suggestions = await this.callGeminiAPI(this.currentContent);
            
            // Apply AI suggestions
            if (suggestions && suggestions.length > 0) {
                const enhancedContent = suggestions[0];
                textarea.value = enhancedContent;
                this.currentContent = enhancedContent;
                this.updatePreview();
                
                // Show success state
                aiStatus.innerHTML = '<i class="fas fa-check-circle"></i> AI Enhanced';
                aiStatus.style.color = 'var(--success-color)';
            }
        } catch (error) {
            console.error('AI content generation failed:', error);
            aiStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> AI Error';
            aiStatus.style.color = 'var(--error-color)';
        }

        // Reset status after 3 seconds
        setTimeout(() => {
            aiStatus.innerHTML = '<i class="fas fa-robot"></i> AI Ready';
            aiStatus.style.color = 'var(--success-color)';
        }, 3000);
    }

    async callGeminiAPI(content) {
        // Mock AI suggestions for demo purposes
        const mockSuggestions = [
            `${content}\n\n#Pinterest #Creative #Inspiration #DIY #Lifestyle #HomeDecor`,
            `🚀 ${content}\n\nWhat are your thoughts on this? Let me know in the comments below! 👇`,
            `💡 Pro tip: ${content}\n\nThis strategy has helped us achieve amazing results. What's your experience?`,
            `${content}\n\n✨ Key takeaways:\n• Focus on value\n• Engage authentically\n• Measure results\n\nWhat would you add?`,
            `🔥 Hot take: ${content}\n\nAgree or disagree? I'd love to hear your perspective! 💬`
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return random suggestion
        return [mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)]];
    }

    initializeDemoData() {
        // Add some demo content to showcase the interface
        const demoContent = "Excited to share our latest creative project! 🎨 This beautiful DIY tutorial will inspire your next Pinterest board. The response has been incredible so far!";
        
        setTimeout(() => {
            document.getElementById('contentTextarea').value = demoContent;
            this.currentContent = demoContent;
            this.updatePreview();
        }, 1000);
    }

    handlePublish() {
        if (this.selectedPlatforms.size === 0) {
            this.showNotification('Please select at least one platform', 'error');
            return;
        }

        if (!this.currentContent.trim()) {
            this.showNotification('Please write some content first', 'error');
            return;
        }

        // Show publishing animation
        const publishBtn = document.getElementById('publishBtn');
        const originalText = publishBtn.innerHTML;
        
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        publishBtn.disabled = true;

        // Simulate publishing process
        setTimeout(() => {
            publishBtn.innerHTML = '<i class="fas fa-check"></i> Published!';
            this.showNotification(`Successfully published to ${this.selectedPlatforms.size} platform(s)!`, 'success');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                publishBtn.innerHTML = originalText;
                publishBtn.disabled = false;
            }, 3000);
        }, 2000);
    }

    handleSaveDraft() {
        const draftData = {
            content: this.currentContent,
            platforms: Array.from(this.selectedPlatforms),
            images: this.uploadedImages.map(img => img.url),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('linkerlab_draft', JSON.stringify(draftData));
        this.showNotification('Draft saved successfully!', 'success');
    }

    handleSchedulePost() {
        this.showNotification('Scheduling feature coming soon!', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LinkerLab();
});

// Add some additional CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-content i {
        font-size: 18px;
    }
    
    .notification-content span {
        font-weight: 500;
    }
`;
document.head.appendChild(notificationStyles);

// Add CSS for image items
const imageItemStyles = document.createElement('style');
imageItemStyles.textContent = `
    .image-item {
        position: relative;
        display: inline-block;
    }
    
    .image-item img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        border: 2px solid var(--gray-200);
    }
    
    .remove-image {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--error-color);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s ease;
    }
    
    .remove-image:hover {
        background: #dc2626;
        transform: scale(1.1);
    }
    
    .dragover {
        border-color: var(--primary-color) !important;
        background: rgba(99, 102, 241, 0.1) !important;
        transform: scale(1.02);
    }
`;
document.head.appendChild(imageItemStyles);

// Add platform-specific preview styles
const platformStyles = document.createElement('style');
platformStyles.textContent = `
    .linkedin-style {
        border-left: 4px solid #0077b5;
    }
    
    .facebook-style {
        border-left: 4px solid #1877f2;
    }
    
    .instagram-style {
        border-left: 4px solid #e4405f;
    }
    
    .twitter-style {
        border-left: 4px solid #1da1f2;
    }
`;
document.head.appendChild(platformStyles);
