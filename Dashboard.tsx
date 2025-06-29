import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Video, 
  Link2, 
  DollarSign, 
  Users, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Eye,
  Heart,
  Share2,
  Download,
  RefreshCw,
  Upload,
  Calendar,
  Activity,
  Database,
  Bot,
  Zap,
  Target,
  TrendingDown
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  platform: 'Hotmart' | 'KiwiPay' | 'Eduzz';
  price: number;
  commission: number;
  sales: number;
  status: 'active' | 'pending' | 'inactive';
  lastScraped: string;
  category: string;
  rating: number;
  affiliateLink: string;
}

interface Video {
  id: string;
  productId: string;
  status: 'generating' | 'ready' | 'posted' | 'failed';
  duration: number;
  views: number;
  likes: number;
  shares: number;
  createdAt: string;
  filePath?: string;
  thumbnailPath?: string;
}

interface SystemMetrics {
  uptime: number;
  videosGenerated: number;
  postsToday: number;
  totalRevenue: number;
  activeProducts: number;
  avgResponseTime: number;
  scrapingStatus: 'running' | 'idle' | 'error';
  videoGenerationQueue: number;
  tiktokConnected: boolean;
  automationEnabled: boolean;
}

interface AutomationConfig {
  scraping: {
    interval: number;
    searchTerms: string[];
    productsPerPlatform: number;
  };
  videoGeneration: {
    interval: number;
    maxVideosPerRun: number;
    duration: { min: number; max: number };
  };
  posting: {
    interval: number;
    maxPostsPerDay: number;
    activeHours: { start: string; end: string };
    randomDelay: { min: number; max: number };
  };
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'videos' | 'automation' | 'analytics'>('overview');
  const [isAutomationRunning, setIsAutomationRunning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.9,
    videosGenerated: 1247,
    postsToday: 23,
    totalRevenue: 15679.50,
    activeProducts: 156,
    avgResponseTime: 145,
    scrapingStatus: 'running',
    videoGenerationQueue: 5,
    tiktokConnected: true,
    automationEnabled: true
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Curso de Marketing Digital Completo - Do Zero ao Avançado',
      platform: 'Hotmart',
      price: 297,
      commission: 40,
      sales: 87,
      status: 'active',
      lastScraped: '2024-01-20T10:30:00Z',
      category: 'Marketing',
      rating: 4.8,
      affiliateLink: 'https://hotmart.com/product/123?a=affiliate_id'
    },
    {
      id: '2',
      title: 'Fórmula do E-commerce Lucrativo - Método Completo',
      platform: 'Eduzz',
      price: 497,
      commission: 50,
      sales: 156,
      status: 'active',
      lastScraped: '2024-01-20T10:28:00Z',
      category: 'E-commerce',
      rating: 4.9,
      affiliateLink: 'https://eduzz.com/product/456?ref=affiliate_id'
    },
    {
      id: '3',
      title: 'Masterclass de Vendas Online - Técnicas Avançadas',
      platform: 'KiwiPay',
      price: 197,
      commission: 35,
      sales: 43,
      status: 'pending',
      lastScraped: '2024-01-20T10:25:00Z',
      category: 'Vendas',
      rating: 4.6,
      affiliateLink: 'https://kiwipay.com.br/product/789?affiliate=affiliate_id'
    }
  ]);

  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      productId: '1',
      status: 'posted',
      duration: 45,
      views: 12500,
      likes: 890,
      shares: 156,
      createdAt: '2024-01-20T08:00:00Z'
    },
    {
      id: '2',
      productId: '2',
      status: 'ready',
      duration: 38,
      views: 0,
      likes: 0,
      shares: 0,
      createdAt: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      productId: '1',
      status: 'generating',
      duration: 0,
      views: 0,
      likes: 0,
      shares: 0,
      createdAt: '2024-01-20T10:30:00Z'
    }
  ]);

  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>({
    scraping: {
      interval: 6,
      searchTerms: ['marketing digital', 'curso online', 'ebook', 'negócio online'],
      productsPerPlatform: 10
    },
    videoGeneration: {
      interval: 2,
      maxVideosPerRun: 5,
      duration: { min: 15, max: 60 }
    },
    posting: {
      interval: 3,
      maxPostsPerDay: 8,
      activeHours: { start: '09:00', end: '21:00' },
      randomDelay: { min: 30, max: 120 }
    }
  });

  // API Functions
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/overview');
      if (response.ok) {
        const data = await response.json();
        setMetrics(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const runScraping = async (searchTerms: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerms, productsPerPlatform: 10 })
      });
      
      if (response.ok) {
        await fetchProducts();
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Error running scraping:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideo = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      
      if (response.ok) {
        await fetchVideos();
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToTikTok = async (videoId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tiktok/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });
      
      if (response.ok) {
        await fetchVideos();
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Error uploading to TikTok:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutomation = async () => {
    try {
      const endpoint = isAutomationRunning ? '/api/automation/stop' : '/api/automation/start';
      const response = await fetch(endpoint, { method: 'POST' });
      
      if (response.ok) {
        setIsAutomationRunning(!isAutomationRunning);
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchVideos();
    fetchMetrics();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'posted':
      case 'ready':
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'generating':
      case 'idle':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Hotmart':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Eduzz':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'KiwiPay':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Affiliate Automation Hub
              </h1>
              <p className="text-sm text-gray-600">Sistema Integrado de Marketing de Afiliados</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* System Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${metrics.tiktokConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-700">TikTok API</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${metrics.scrapingStatus === 'running' ? 'bg-blue-500' : 'bg-gray-400'} animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-700">Scraping</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isAutomationRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isAutomationRunning ? 'Sistema Ativo' : 'Sistema Pausado'}
                </span>
              </div>
            </div>
            
            {/* Control Button */}
            <button
              onClick={toggleAutomation}
              disabled={isLoading}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                isAutomationRunning 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isAutomationRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isAutomationRunning ? 'Pausar Sistema' : 'Iniciar Sistema'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-6 sticky top-[73px] z-40">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'products', label: 'Produtos', icon: Database },
            { id: 'videos', label: 'Vídeos', icon: Video },
            { id: 'automation', label: 'Automação', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Health Alert */}
            {metrics.uptime < 99 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Atenção: Sistema com instabilidade</p>
                  <p className="text-sm text-yellow-700">Uptime atual: {metrics.uptime}% - Verificando componentes...</p>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Uptime Sistema</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.uptime}%</p>
                    <p className="text-xs text-green-600 mt-1">+0.1% vs. ontem</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vídeos Gerados</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.videosGenerated.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">+47 hoje</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Posts Hoje</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.postsToday}</p>
                    <p className="text-xs text-purple-600 mt-1">Meta: 25/dia</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
                    <p className="text-xs text-green-600 mt-1">+12.5% vs. mês anterior</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.activeProducts}</p>
                    <p className="text-xs text-orange-600 mt-1">+8 esta semana</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tempo Resposta</p>
                    <p className="text-2xl font-bold text-indigo-600">{metrics.avgResponseTime}ms</p>
                    <p className="text-xs text-indigo-600 mt-1">Excelente</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Atividade em Tempo Real</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Ao vivo</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Vídeo gerado com sucesso</p>
                      <p className="text-sm text-gray-600">Curso de Marketing Digital - 45s</p>
                    </div>
                    <span className="text-xs text-gray-500">agora</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-green-50 border border-green-100">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Post publicado no TikTok</p>
                      <p className="text-sm text-gray-600">1.2K visualizações em 5 min</p>
                    </div>
                    <span className="text-xs text-gray-500">2 min</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Novos produtos encontrados</p>
                      <p className="text-sm text-gray-600">12 produtos da Hotmart adicionados</p>
                    </div>
                    <span className="text-xs text-gray-500">5 min</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Nova conversão registrada</p>
                      <p className="text-sm text-gray-600">R$ 297,00 - Comissão: R$ 118,80</p>
                    </div>
                    <span className="text-xs text-gray-500">8 min</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance dos Vídeos</h3>
                <div className="space-y-4">
                  {videos.slice(0, 4).map((video) => {
                    const product = products.find(p => p.id === video.productId);
                    return (
                      <div key={video.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          
                          <p className="font-medium text-gray-900 line-clamp-1">{product?.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {video.views.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {video.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Share2 className="w-4 h-4 mr-1" />
                              {video.shares.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(video.status)}`}>
                            {video.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{video.duration}s</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => runScraping(['marketing digital', 'curso online'])}
                  disabled={isLoading}
                  className="p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left disabled:opacity-50"
                >
                  <Database className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-900">Executar Scraping</p>
                  <p className="text-sm text-gray-600">Buscar novos produtos</p>
                </button>
                
                <button
                  onClick={() => products.length > 0 && generateVideo(products[0].id)}
                  disabled={isLoading || products.length === 0}
                  className="p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors text-left disabled:opacity-50"
                >
                  <Video className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-900">Gerar Vídeo</p>
                  <p className="text-sm text-gray-600">Criar novo conteúdo</p>
                </button>
                
                <button
                  onClick={() => videos.length > 0 && uploadToTikTok(videos[0].id)}
                  disabled={isLoading || videos.length === 0}
                  className="p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-left disabled:opacity-50"
                >
                  <Upload className="w-8 h-8 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Postar TikTok</p>
                  <p className="text-sm text-gray-600">Upload imediato</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                >
                  <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                  <p className="font-medium text-gray-900">Ver Relatórios</p>
                  <p className="text-sm text-gray-600">Análise detalhada</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Produtos</h2>
                <p className="text-gray-600 mt-1">Produtos coletados automaticamente das plataformas de afiliados</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => runScraping(automationConfig.scraping.searchTerms)}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Atualizar Produtos</span>
                </button>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Hotmart', 'Eduzz', 'KiwiPay'].map((platform) => {
                const platformProducts = products.filter(p => p.platform === platform);
                const activeCount = platformProducts.filter(p => p.status === 'active').length;
                const totalRevenue = platformProducts.reduce((sum, p) => sum + (p.price * p.sales * p.commission / 100), 0);
                
                return (
                  <div key={platform} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{platform}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlatformColor(platform)}`}>
                        {platformProducts.length} produtos
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ativos:</span>
                        <span className="text-sm font-medium text-gray-900">{activeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Receita:</span>
                        <span className="text-sm font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Products Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plataforma
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comissão
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendas
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-200/50">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlatformColor(product.platform)}`}>
                            {product.platform}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="font-medium text-green-600">{product.commission}%</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.sales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1">{product.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => generateVideo(product.id)}
                              disabled={isLoading}
                              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              title="Gerar Vídeo"
                            >
                              <Video className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.open(product.affiliateLink, '_blank')}
                              className="text-green-600 hover:text-green-800"
                              title="Ver Produto"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Produção de Vídeos</h2>
                <p className="text-gray-600 mt-1">Vídeos gerados automaticamente para TikTok</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => products.length > 0 && generateVideo(products[0].id)}
                  disabled={isLoading || products.length === 0}
                  className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  <span>Gerar Novo Vídeo</span>
                </button>
              </div>
            </div>

            {/* Video Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Vídeos</p>
                    <p className="text-2xl font-bold text-blue-600">{videos.length}</p>
                  </div>
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Prontos para Postar</p>
                    <p className="text-2xl font-bold text-green-600">{videos.filter(v => v.status === 'ready').length}</p>
                  </div>
                  <Upload className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Processamento</p>
                    <p className="text-2xl font-bold text-yellow-600">{videos.filter(v => v.status === 'generating').length}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Publicados</p>
                    <p className="text-2xl font-bold text-purple-600">{videos.filter(v => v.status === 'posted').length}</p>
                  </div>
                  <Share2 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const product = products.find(p => p.id === video.productId);
                return (
                  <div key={video.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-md transition-all duration-200">
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center relative">
                      <Video className="w-16 h-16 text-white" />
                      {video.status === 'generating' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product?.title}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(video.status)}`}>
                          {video.status}
                        </span>
                        <span className="text-sm text-gray-500">{video.duration}s</span>
                      </div>
                      
                      {video.status === 'posted' && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {video.views.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {video.likes.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(video.createdAt)}
                        </span>
                        <div className="flex space-x-2">
                          {video.status === 'ready' && (
                            <button
                              onClick={() => uploadToTikTok(video.id)}
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              title="Postar no TikTok"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Configurações de Automação</h2>
              <p className="text-gray-600 mt-1">Configure os parâmetros do sistema automatizado</p>
            </div>
            
            {/* Automation Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Status da Automação</h3>
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${isAutomationRunning ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="font-medium text-gray-700">
                    {isAutomationRunning ? 'Sistema Ativo' : 'Sistema Pausado'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Scraping</p>
                  <p className="text-sm text-gray-600">A cada {automationConfig.scraping.interval}h</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metrics.scrapingStatus)}`}>
                    {metrics.scrapingStatus}
                  </span>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Geração de Vídeos</p>
                  <p className="text-sm text-gray-600">A cada {automationConfig.videoGeneration.interval}h</p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    {metrics.videoGenerationQueue} na fila
                  </span>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
                  <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Postagem TikTok</p>
                  <p className="text-sm text-gray-600">A cada {automationConfig.posting.interval}h</p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {metrics.postsToday}/{automationConfig.posting.maxPostsPerDay} hoje
                  </span>
                </div>
              </div>
            </div>

            {/* Configuration Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scraping Configuration */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Configurações de Scraping
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalo entre Execuções (horas)
                    </label>
                    <input
                      type="number"
                      value={automationConfig.scraping.interval}
                      onChange={(e) => setAutomationConfig(prev => ({
                        ...prev,
                        scraping: { ...prev.scraping, interval: parseInt(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Produtos por Plataforma
                    </label>
                    <input
                      type="number"
                      value={automationConfig.scraping.productsPerPlatform}
                      onChange={(e) => setAutomationConfig(prev => ({
                        ...prev,
                        scraping: { ...prev.scraping, productsPerPlatform: parseInt(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="5"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Termos de Busca
                    </label>
                    <div className="space-y-2">
                      {automationConfig.scraping.searchTerms.map((term, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={term}
                            onChange={(e) => {
                              const newTerms = [...automationConfig.scraping.searchTerms];
                              newTerms[index] = e.target.value;
                              setAutomationConfig(prev => ({
                                ...prev,
                                scraping: { ...prev.scraping, searchTerms: newTerms }
                              }));
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Generation Configuration */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-purple-600" />
                  Configurações de Vídeo
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração do Vídeo (segundos)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                        <input
                          type="number"
                          value={automationConfig.videoGeneration.duration.min}
                          onChange={(e) => setAutomationConfig(prev => ({
                            ...prev,
                            videoGeneration: {
                              ...prev.videoGeneration,
                              duration: { ...prev.videoGeneration.duration, min: parseInt(e.target.value) }
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="15"
                          max="60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                        <input
                          type="number"
                          value={automationConfig.videoGeneration.duration.max}
                          onChange={(e) => setAutomationConfig(prev => ({
                            ...prev,
                            videoGeneration: {
                              ...prev.videoGeneration,
                              duration: { ...prev.videoGeneration.duration, max: parseInt(e.target.value) }
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="15"
                          max="60"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vídeos por Execução
                    </label>
                    <input
                      type="number"
                      value={automationConfig.videoGeneration.maxVideosPerRun}
                      onChange={(e) => setAutomationConfig(prev => ({
                        ...prev,
                        videoGeneration: { ...prev.videoGeneration, maxVideosPerRun: parseInt(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voz para Narração
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>ElevenLabs - Rachel (Português)</option>
                      <option>Google TTS - Português Brasileiro</option>
                      <option>Azure TTS - Maria</option>
                      <option>Amazon Polly - Camila</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Adicionar música de fundo</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Gerar thumbnail automaticamente</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="ml-2 text-sm text-gray-700">Adicionar marca d'água</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* TikTok Posting Configuration */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-green-600" />
                  Configurações do TikTok
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posts Máximos por Dia
                    </label>
                    <input
                      type="number"
                      value={automationConfig.posting.maxPostsPerDay}
                      onChange={(e) => setAutomationConfig(prev => ({
                        ...prev,
                        posting: { ...prev.posting, maxPostsPerDay: parseInt(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                      max="20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário Ativo
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Início</label>
                        <input
                          type="time"
                          value={automationConfig.posting.activeHours.start}
                          onChange={(e) => setAutomationConfig(prev => ({
                            ...prev,
                            posting: {
                              ...prev.posting,
                              activeHours: { ...prev.posting.activeHours, start: e.target.value }
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fim</label>
                        <input
                          type="time"
                          value={automationConfig.posting.activeHours.end}
                          onChange={(e) => setAutomationConfig(prev => ({
                            ...prev,
                            posting: {
                              ...prev.posting,
                              activeHours: { ...prev.posting.activeHours, end: e.target.value }
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Aleatório (minutos)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                        <input
                          type="number"
                          value={automationConfig.posting.randomDelay.min}
                          onChange={(e) => setAutomationConfig(prev => ({
                            ...prev,
                            posting: {
                              ...prev.posting,
                              randomDelay: { ...prev.posting.randomDelay, min: parseInt(e.target.value) }
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min="0"
                          max="180"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                        <input
                          type="number"
                          value={automationConfig.posting.randomDelay.max}
                          onChange={(e) => setAutomationConfig(prev => ({
                            ...prev,
                            posting: {
                              ...prev.posting,
                              randomDelay: { ...prev.posting.randomDelay, max: parseInt(e.target.value) }
                            }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min="0"
                          max="180"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Postar apenas em dias úteis</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Hashtags automáticas</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                      <span className="ml-2 text-sm text-gray-700">Agendar para horários de pico</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Processing Queue */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Fila de Processamento
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Gerando vídeo: Curso de Marketing Digital</p>
                        <p className="text-sm text-gray-600">Tempo estimado: 2 minutos restantes</p>
                      </div>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{width: '75%'}}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Vídeo pronto: Fórmula do E-commerce</p>
                        <p className="text-sm text-gray-600">Aguardando horário de postagem (14:30)</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">Pronto</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Próximo scraping agendado</p>
                        <p className="text-sm text-gray-600">Hotmart, Eduzz, KiwiPay - em 3 horas</p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-medium">Agendado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Configuration */}
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics e Relatórios</h2>
              <p className="text-gray-600 mt-1">Análise detalhada da performance do sistema</p>
            </div>
            
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">CTR Médio</p>
                    <p className="text-2xl font-bold text-blue-600">3.2%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <p className="text-sm text-green-600">+0.5% vs. mês anterior</p>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-green-600">1.8%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <p className="text-sm text-green-600">+0.3% vs. mês anterior</p>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-purple-600">R$ 347</p>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                      <p className="text-sm text-red-600">-R$ 12 vs. mês anterior</p>
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className="text-2xl font-bold text-orange-600">187%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <p className="text-sm text-green-600">+23% vs. mês anterior</p>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance por Plataforma</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Hotmart</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">R$ 8.450</p>
                      <p className="text-xs text-gray-500">54% do total</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '54%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Eduzz</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">R$ 4.230</p>
                      <p className="text-xs text-gray-500">27% do total</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '27%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">KiwiPay</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">R$ 3.000</p>
                      <p className="text-xs text-gray-500">19% do total</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '19%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Horários de Maior Engajamento</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">19:00 - 21:00</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">12:00 - 14:00</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '72%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">21:00 - 23:00</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">08:00 - 10:00</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">45%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Produtos por Conversão</h3>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-sm text-gray-600">{product.sales} conversões</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(product.price * product.sales * product.commission / 100)}</p>
                        <p className="text-sm text-gray-500">{product.commission}% comissão</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas do Sistema</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Uptime</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{metrics.uptime}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Tempo de Resposta</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{metrics.avgResponseTime}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Video className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Vídeos Processados</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{metrics.videosGenerated}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Produtos Ativos</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{metrics.activeProducts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Exportar Relatórios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <Download className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-900">Relatório Completo</p>
                  <p className="text-sm text-gray-600">PDF com todas as métricas</p>
                </button>
                
                <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Dados de Performance</p>
                  <p className="text-sm text-gray-600">CSV com métricas detalhadas</p>
                </button>
                
                <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-900">Relatório Mensal</p>
                  <p className="text-sm text-gray-600">Resumo executivo do mês</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;