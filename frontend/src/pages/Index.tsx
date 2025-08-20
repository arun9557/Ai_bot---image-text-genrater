import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Sparkles, Send, Image, Crown, Heart, Zap, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingButton } from "@/components/LoadingButton";
import { StatusIndicator } from "@/components/StatusIndicator";
import { SMSForm } from "@/components/SMSForm";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "image" | "sms">("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    stage: string;
    progress: number;
    estimatedTime: number;
  } | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(2);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = chatMessage;
    setChatMessage("");
    setIsLoading(true);

    try {
      console.log('Sending message to API:', currentMessage);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
        }),
      });
      console.log('API Response status:', response.status);

      const data = await response.json();
      console.log('API Response data:', data);

      if (response.ok) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.error || 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Network error. Please check your connection and try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (isRetry = false) => {
    if (!imagePrompt.trim()) return;

    if (!isRetry) {
      setRetryCount(0);
    }

    setIsGeneratingImage(true);
    setGenerationError(null);
    if (!isRetry) {
      setGeneratedImage(null);
    }
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    setAbortController(controller);
    
    // Detect prompt complexity for dynamic timeout
    const promptComplexity = detectPromptComplexity(imagePrompt);
    const baseTimeout = promptComplexity === 'high' ? 240000 : promptComplexity === 'medium' ? 180000 : 120000;
    
    // Extended timeout for complex image generation (up to 4 minutes for complex prompts)
    const timeoutId = setTimeout(() => controller.abort(), baseTimeout);
    
    // More realistic progress simulation
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (!prev) {
          return { 
            stage: 'Initializing AI models...', 
            progress: 5, 
            estimatedTime: Math.floor(baseTimeout / 1000) 
          };
        }
        if (prev.progress < 95) {
          const increment = promptComplexity === 'high' ? Math.random() * 8 : 
                           promptComplexity === 'medium' ? Math.random() * 12 : 
                           Math.random() * 15;
          const newProgress = prev.progress + increment;
          
          let newStage = prev.stage;
          if (newProgress < 20) newStage = 'Processing prompt...';
          else if (newProgress < 40) newStage = 'Generating composition...';
          else if (newProgress < 60) newStage = 'Rendering details...';
          else if (newProgress < 80) newStage = 'Applying artistic effects...';
          else if (newProgress < 95) newStage = 'Finalizing artwork...';
          
          return {
            stage: newStage,
            progress: Math.min(newProgress, 95),
            estimatedTime: Math.max(prev.estimatedTime - 3, 5)
          };
        }
        return prev;
      });
    }, 3000);
    
    try {
      console.log('Generating image with prompt:', imagePrompt, 'Complexity:', promptComplexity, 'Timeout:', baseTimeout/1000 + 's');
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          width: 1024,
          height: 1024,
          seed: Math.floor(Math.random() * 1000000)
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (response.ok) {
        // Convert response to blob and create object URL
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setGeneratedImage(imageUrl);
        setGenerationProgress({ stage: 'Complete!', progress: 100, estimatedTime: 0 });
        setRetryCount(0);
        console.log('Image generated successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to generate image:', errorData);
        
        // Check if we should retry
        if (retryCount < maxRetries && (response.status === 500 || response.status === 503)) {
          console.log(`Retrying generation (attempt ${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          // Exponential backoff: wait 2^retryCount seconds
          setTimeout(() => handleGenerateImage(true), Math.pow(2, retryCount) * 2000);
          return;
        }
        
        setGenerationError(getEnhancedErrorMessage(errorData.error || 'Failed to generate image', response.status));
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      
      if (error.name === 'AbortError') {
        const timeoutMessage = promptComplexity === 'high' 
          ? 'Complex image generation timed out after 4 minutes. Try breaking down your prompt into simpler elements or reducing detail requirements.'
          : promptComplexity === 'medium'
          ? 'Image generation timed out after 3 minutes. Consider simplifying your prompt for faster results.'
          : 'Image generation timed out after 2 minutes. Try using a simpler prompt.';
        
        // Offer retry for timeout if we haven't exhausted retries
        if (retryCount < maxRetries) {
          setGenerationError(timeoutMessage + ` Would you like to retry? (Attempt ${retryCount + 1}/${maxRetries + 1})`);
        } else {
          setGenerationError(timeoutMessage + ' Maximum retry attempts reached.');
        }
      } else if (error.message?.includes('fetch')) {
        setGenerationError('Network connection failed. Please check your internet connection and try again.');
      } else {
        // Check if we should retry for network errors
        if (retryCount < maxRetries) {
          console.log(`Retrying generation due to network error (attempt ${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => handleGenerateImage(true), Math.pow(2, retryCount) * 2000);
          return;
        }
        setGenerationError('An unexpected error occurred after multiple attempts. Please try again later.');
      }
    } finally {
      setIsGeneratingImage(false);
      setGenerationProgress(null);
      setAbortController(null);
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
    }
  };

  const detectPromptComplexity = (prompt: string): 'low' | 'medium' | 'high' => {
    const complexKeywords = [
      'photorealistic', 'hyperrealistic', '8k', '4k', 'ultra detailed', 'intricate',
      'cinematic', 'professional photography', 'studio lighting', 'ray tracing',
      'volumetric', 'atmospheric', 'dramatic lighting', 'bokeh', 'depth of field'
    ];
    
    const mediumKeywords = [
      'detailed', 'realistic', 'beautiful', 'artistic', 'stylized', 'rendered',
      'digital art', 'concept art', 'illustration', 'painting', 'portrait'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    const complexCount = complexKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    const mediumCount = mediumKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    
    if (complexCount >= 2 || prompt.length > 200) return 'high';
    if (complexCount >= 1 || mediumCount >= 2 || prompt.length > 100) return 'medium';
    return 'low';
  };

  const getEnhancedErrorMessage = (error: string, status?: number): string => {
    if (status === 429) {
      return 'Server is busy processing other requests. Please wait a moment and try again.';
    }
    if (status === 503) {
      return 'Image generation service is temporarily unavailable. This usually resolves quickly - please try again.';
    }
    if (status === 500) {
      return 'Server encountered an error processing your request. This might be due to prompt complexity - try simplifying your description.';
    }
    if (error.toLowerCase().includes('timeout')) {
      return 'Generation took longer than expected. Try using a simpler prompt or check your connection.';
    }
    if (error.toLowerCase().includes('memory') || error.toLowerCase().includes('resource')) {
      return 'Server resources are currently limited. Try again in a few moments or use a shorter prompt.';
    }
    return error || 'An unexpected error occurred. Please try again.';
  };

  const handleCancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsGeneratingImage(false);
      setGenerationProgress(null);
      setGenerationError('Generation cancelled by user.');
      setRetryCount(0);
    }
  };

  const handleRetryGeneration = () => {
    if (retryCount < maxRetries) {
      handleGenerateImage(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-gold rounded-xl shadow-gold royal-glow animate-float">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-playfair font-semibold text-foreground">Royal Studio</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-montserrat">Premium AI Experience</p>
                <p className="text-xs text-accent font-montserrat font-medium mt-1 hidden sm:block">by Arun Shekhar</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
              <StatusIndicator status="online" />
              <div className="hidden md:flex items-center space-x-2">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-accent animate-glow" />
                <span className="text-xs sm:text-sm font-montserrat text-muted-foreground">Crafted with love</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2 bg-gradient-royal/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-accent/30 shadow-elegant">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-accent animate-glow" />
                <span className="text-xs sm:text-sm font-montserrat font-semibold text-foreground">
                  Arun Shekhar
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 sm:mb-12">
          <div className="glass-card rounded-2xl p-1 sm:p-2 shadow-elegant elegant-hover w-full max-w-md sm:max-w-none sm:w-auto">
            <div className="flex space-x-1 sm:space-x-2">
              <Button
                variant={activeTab === "chat" ? "default" : "ghost"}
                onClick={() => setActiveTab("chat")}
                className={`flex-1 sm:flex-none px-3 sm:px-8 py-2 sm:py-3 font-montserrat font-medium transition-royal relative overflow-hidden text-xs sm:text-sm ${
                  activeTab === "chat" 
                    ? "bg-gradient-royal text-primary-foreground shadow-soft royal-glow" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Chat
              </Button>
              <Button
                variant={activeTab === "image" ? "default" : "ghost"}
                onClick={() => setActiveTab("image")}
                className={`flex-1 sm:flex-none px-3 sm:px-8 py-2 sm:py-3 font-montserrat font-medium transition-royal relative overflow-hidden text-xs sm:text-sm ${
                  activeTab === "image" 
                    ? "bg-gradient-royal text-primary-foreground shadow-soft royal-glow" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Image Generator</span>
                <span className="sm:hidden">Image</span>
              </Button>
                             <Button
                 variant={activeTab === "sms" ? "default" : "ghost"}
                 onClick={() => {
                   console.log('SMS tab clicked!');
                   console.log('Current activeTab:', activeTab);
                   setActiveTab("sms");
                   console.log('Setting activeTab to sms');
                 }}
                 className={`flex-1 sm:flex-none px-3 sm:px-8 py-2 sm:py-3 font-montserrat font-medium transition-royal relative overflow-hidden text-xs sm:text-sm ${
                   activeTab === "sms" 
                     ? "bg-gradient-royal text-primary-foreground shadow-soft royal-glow" 
                     : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                 }`}
               >
                 <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                 SMS
               </Button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Debug Info */}
          <div className="text-center mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> Current tab: {activeTab} | 
              SMS tab should show content when activeTab === "sms"
            </p>
          </div>
          {activeTab === "chat" && (
            <Card className="glass-card shadow-elegant elegant-hover border-border/50">
              <CardHeader className="text-center pb-4 sm:pb-8 px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-3xl font-playfair text-foreground mb-2">
                  Elegant Conversation
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg font-montserrat text-muted-foreground">
                  Experience refined AI dialogue with royal sophistication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {/* Chat Messages Area */}
                <div className="min-h-[300px] sm:min-h-[400px] bg-gradient-subtle rounded-xl p-3 sm:p-6 border border-border/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    {chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <div className="relative">
                            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/50 animate-float" />
                            <Zap className="w-4 h-4 sm:w-6 sm:h-6 absolute -top-1 -right-1 text-accent animate-glow" />
                          </div>
                          <p className="text-muted-foreground font-montserrat text-sm sm:text-base">
                            Start a conversation to begin your royal experience
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                                message.sender === 'user'
                                  ? 'bg-gradient-royal text-primary-foreground'
                                  : 'bg-card/80 backdrop-blur-sm border border-border/50'
                              }`}
                            >
                              <p className="font-montserrat text-xs sm:text-sm">{message.text}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Textarea
                    placeholder="Share your thoughts with elegant grace..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 min-h-[60px] sm:min-h-[80px] font-montserrat premium-input resize-none transition-royal text-sm"
                    disabled={isLoading}
                  />
                  <LoadingButton
                    icon={Send}
                    onAsyncClick={handleSendMessage}
                    loadingText="Sending..."
                    className="bg-gradient-royal hover:opacity-90 text-primary-foreground shadow-elegant px-4 sm:px-8 font-montserrat font-medium transition-royal royal-glow text-sm w-full sm:w-auto"
                    disabled={!chatMessage.trim() || isLoading}
                  >
                    Send
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "image" && (
            <Card className="glass-card shadow-elegant elegant-hover border-border/50">
              <CardHeader className="text-center pb-4 sm:pb-8 px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-3xl font-playfair text-foreground mb-2">
                  Artistic Creation
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg font-montserrat text-muted-foreground">
                  Generate exquisite imagery with royal elegance and sophistication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {/* Image Preview Area */}
                <div className="min-h-[300px] sm:min-h-[400px] bg-gradient-subtle rounded-xl p-3 sm:p-6 border border-border/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
                  <div className="relative z-10 h-full">
                    {isGeneratingImage ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4 sm:space-y-6 w-full max-w-md px-4">
                          <div className="relative">
                            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-secondary animate-spin" />
                          </div>
                          
                          {/* Progress Bar */}
                          {generationProgress && (
                            <div className="space-y-3">
                              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                                <span className="truncate">{generationProgress.stage}</span>
                                <span>{Math.round(generationProgress.progress)}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-royal h-2 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${generationProgress.progress}%` }}
                                ></div>
                              </div>
                              {generationProgress.estimatedTime > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Estimated time remaining: ~{generationProgress.estimatedTime}s
                                </p>
                              )}
                            </div>
                          )}
                          
                          <p className="text-muted-foreground font-montserrat text-sm">
                            Creating your masterpiece...
                          </p>
                          
                          {/* Cancel Button */}
                          <Button
                            onClick={handleCancelGeneration}
                            variant="outline"
                            size="sm"
                            className="mt-4 text-xs sm:text-sm"
                          >
                            Cancel Generation
                          </Button>
                        </div>
                      </div>
                    ) : generationError ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4 max-w-md px-4">
                          <div className="relative">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                              <span className="text-destructive text-xl sm:text-2xl">⚠️</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-destructive font-montserrat font-medium text-sm sm:text-base">
                              Generation Failed
                            </p>
                            <p className="text-muted-foreground font-montserrat text-xs sm:text-sm">
                              {generationError}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button
                              onClick={() => {
                                setGenerationError(null);
                                setImagePrompt("");
                              }}
                              variant="outline"
                              size="sm"
                              className="text-xs sm:text-sm"
                            >
                              Try Again
                            </Button>
                            {retryCount < maxRetries && (
                              <Button
                                onClick={handleRetryGeneration}
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm"
                              >
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : generatedImage ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="relative group w-full">
                          <img 
                            src={generatedImage} 
                            alt="Generated artwork" 
                            className="max-w-full max-h-[250px] sm:max-h-[350px] rounded-lg shadow-elegant object-contain mx-auto"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = generatedImage;
                                link.download = 'royal-studio-artwork.jpg';
                                link.click();
                              }}
                              className="bg-gradient-royal text-primary-foreground shadow-elegant text-xs sm:text-sm"
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <div className="relative">
                            <Image className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/50 animate-float" />
                            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 absolute -top-1 -right-1 text-secondary animate-glow" />
                          </div>
                          <p className="text-muted-foreground font-montserrat text-sm sm:text-base">
                            Your masterpiece will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Image Generation Input */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Input
                    placeholder="Describe your vision with artistic detail..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isGeneratingImage && imagePrompt.trim()) {
                        handleGenerateImage();
                      }
                    }}
                    className="flex-1 font-montserrat premium-input transition-royal text-sm"
                    disabled={isGeneratingImage}
                  />
                  <LoadingButton
                    icon={Sparkles}
                    onAsyncClick={handleGenerateImage}
                    loadingText="Creating..."
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-elegant px-4 sm:px-8 font-montserrat font-medium transition-royal royal-glow text-sm w-full sm:w-auto"
                    disabled={!imagePrompt.trim() || isGeneratingImage}
                  >
                    Create
                  </LoadingButton>
                </div>
                
                {/* Generation Tips */}
                {!isGeneratingImage && !generatedImage && !generationError && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-montserrat px-4">
                      💡 Tip: Complex prompts may take up to 4 minutes to generate. 
                      Be specific and descriptive for better results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "sms" && (
            <div className="flex justify-center px-4 sm:px-0">
              <div className="w-full max-w-4xl mx-auto">
                <SMSForm />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 sm:mt-20 glass-card">
        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground font-montserrat text-xs sm:text-sm">
              Crafted with premium elegance • Where technology meets royal sophistication
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-royal/10 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-border/30">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-accent animate-glow" />
                <span className="text-xs sm:text-sm font-montserrat font-medium text-foreground">
                  Co-Founder: Arun Shekhar
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
