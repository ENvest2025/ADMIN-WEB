import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Eye, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StockTab = 'Basic Information' | 'Financials' | 'News' | 'Buy/Sell list';

const MOCK_STOCK = {
    id: 'ngn-stocks',
    name: 'Access Holdings',
    ticker: 'ACCESSCORP',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Access_Bank_Logo.svg/200px-Access_Bank_Logo.svg.png',
    basicInfo: {
        companyName: 'Access Holdings',
        symbol: 'ACCESSCORP',
        marketType: 'NGN',
        openPrice: '₦6,315.68',
        todayHigh: 'NGN',
        openPrice2: '₦6,315.68',
        sector: 'Finance',
        ceo: 'Mr Chuks Musk',
        dateSource: 'Polygon.io,drivewealth',
        priceUpdated: '30 Jan 2025',
        about: 'Access Bank Plc is one of Africa\'s leading financial institutions',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Access_Bank_Logo.svg/200px-Access_Bank_Logo.svg.png',
    },
    financials: {
        openPrice: '₦6,315.68',
        todayPrice: '₦6,500.00',
        todayHighPrice: '₦6,800.00',
        todayLowPrice: '₦6,200.00',
        week52High: '₦7,000.00',
        week52Low: '₦4,500.00',
        divYield: '2.5%',
        volume: '1,200,000',
        avgVolume: '980,000',
    },
    news: [
        { id: '1', date: '07 May, 2025. 11:30 AM', title: 'Why Apple ,Inc is the top stock in the market in the year 2025', category: 'Finance', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=120&fit=crop' },
        { id: '2', date: '07 May, 2025. 11:30 AM', title: 'Why Apple ,Inc is the top stock in the market in the year 2025', category: 'Finance', image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200&h=120&fit=crop' },
        { id: '3', date: '07 May, 2025. 11:30 AM', title: 'Why Apple ,Inc is the top stock in the market in the year 2025', category: 'Finance', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=120&fit=crop' },
        { id: '4', date: '07 May, 2025. 11:30 AM', title: 'Why Apple ,Inc is the top stock in the market in the year 2025', category: 'Finance', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=120&fit=crop' },
        { id: '5', date: '07 May, 2025. 11:30 AM', title: 'Why Apple ,Inc is the top stock in the market in the year 2025', category: 'Finance', image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200&h=120&fit=crop' },
    ],
    buySellList: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1, units: '00000', buyPrice: '₦0.00', sellPrice: '₦0.00', sellUnits: '00000',
    })),
};

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <div className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50/50">{value}</div>
        </div>
    );
}

function BasicInfoTab() {
    const { basicInfo } = MOCK_STOCK;
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Company name" value={basicInfo.companyName} />
                <InfoRow label="Symbol" value={basicInfo.symbol} />
                <InfoRow label="Market type" value={basicInfo.marketType} />
                <InfoRow label="Open Price" value={basicInfo.openPrice} />
                <InfoRow label="Today's high" value={basicInfo.todayHigh} />
                <InfoRow label="Open Price" value={basicInfo.openPrice2} />
                <InfoRow label="Sector/ Industry" value={basicInfo.sector} />
                <InfoRow label="CEO" value={basicInfo.ceo} />
                <InfoRow label="Date source" value={basicInfo.dateSource} />
                <InfoRow label="Price updated" value={basicInfo.priceUpdated} />
            </div>
            <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">About</p>
                <div className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50/50 min-h-[80px]">
                    {basicInfo.about}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Company logo</p>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <img src={basicInfo.logo} alt="Company logo" className="h-12 object-contain" />
                </div>
            </div>
        </div>
    );
}

function FinancialsTab() {
    const { financials } = MOCK_STOCK;
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Open Price" value={financials.openPrice} />
                <InfoRow label="Today's Price" value={financials.todayPrice} />
                <InfoRow label="Today's high price" value={financials.todayHighPrice} />
                <InfoRow label="Today's low price" value={financials.todayLowPrice} />
                <InfoRow label="52-week high" value={financials.week52High} />
                <InfoRow label="52-week low" value={financials.week52Low} />
                <InfoRow label="Div/yield" value={financials.divYield} />
                <InfoRow label="Volume" value={financials.volume} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Average Volume" value={financials.avgVolume} />
            </div>
        </div>
    );
}

function NewsTab({ onViewArticle }: { onViewArticle: (id: string) => void }) {
    const [news, setNews] = useState(MOCK_STOCK.news);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">All News</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={12} />
                    Filter
                </button>
            </div>
            <div className="space-y-3">
                {news.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <img src={item.image} alt={item.title}
                            className="w-16 h-14 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 mb-1">{item.date}</p>
                            <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => onViewArticle(item.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <Eye size={15} />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-yellow-600 transition-colors">
                                <Pencil size={15} />
                            </button>
                            <button onClick={() => setNews(n => n.filter(x => x.id !== item.id))}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BuySellTab() {
    return (
        <div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-100">
                        {['Units', 'Buy price', 'Sell price', 'Units'].map((col, i) => (
                            <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {MOCK_STOCK.buySellList.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-mono text-slate-600">{row.units}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-emerald-500">{row.buyPrice}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-red-500">{row.sellPrice}</td>
                            <td className="px-4 py-3 text-sm font-mono text-slate-600">{row.sellUnits}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function StockDetail() {
    const navigate = useNavigate();
    const { stockId } = useParams();
    const [activeTab, setActiveTab] = useState<StockTab>('Basic Information');
    const [viewingArticle, setViewingArticle] = useState<string | null>(null);

    const tabs: StockTab[] = ['Basic Information', 'Financials', 'News', 'Buy/Sell list'];

    if (viewingArticle) {
        const article = MOCK_STOCK.news.find(n => n.id === viewingArticle);
        return (
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => setViewingArticle(null)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400">Investment Products</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-semibold">Access Holdings</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <div className="grid grid-cols-4 gap-6 mb-6 pb-6 border-b border-slate-100">
                        {[
                            { label: 'Published by', value: 'George Dean' },
                            { label: 'Category', value: 'Academic' },
                            { label: 'Date published', value: '03 Jan 2023' },
                            { label: 'Read time', value: '10 min' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-xs text-slate-400 mb-1">{label}</p>
                                <p className="text-sm font-semibold text-slate-800">{value}</p>
                            </div>
                        ))}
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-4">{article?.title}</h1>
                    <img src={article?.image} alt={article?.title}
                        className="w-full h-64 object-cover rounded-xl mb-6" />
                    {['Ready to learn', 'Inspiring Educators', 'Striving for Excellence', 'A World of Possibilities', 'Stronger Together', 'Upcoming Events'].map((section) => (
                        <div key={section} className="mb-5">
                            <h2 className="text-base font-bold text-slate-900 mb-2">{section}</h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Unicaf, welcomed students back to campus with open arms as the new academic year kicked off with a burst of excitement and enthusiasm. The hallways echoed with laughter, and classrooms buzzed with anticipation as students, teachers, and staff reunited after a well-deserved break.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate('/dashboard/investments')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => navigate('/dashboard/investments')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    Investment Products
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">{MOCK_STOCK.name}</span>
            </div>

            {/* Dark Header Banner */}
            <div className="bg-[#0A0E1A] rounded-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5">
                        <img src={MOCK_STOCK.logo} alt={MOCK_STOCK.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white">{MOCK_STOCK.name}</h1>
                        <p className="text-xs text-slate-400">{MOCK_STOCK.ticker}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                        Next
                    </button>
                    <button onClick={() => navigate(`/dashboard/investments/${stockId}/edit`)}
                        className="px-4 py-2 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                        Edit details
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex gap-6">
                {/* Sidebar Tabs */}
                <div className="w-48 shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                activeTab === tab
                                    ? "bg-yellow-50 text-[#B8860B] font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    {activeTab === 'Basic Information' && <BasicInfoTab />}
                    {activeTab === 'Financials' && <FinancialsTab />}
                    {activeTab === 'News' && <NewsTab onViewArticle={setViewingArticle} />}
                    {activeTab === 'Buy/Sell list' && <BuySellTab />}
                </div>
            </div>
        </div>
    );
}