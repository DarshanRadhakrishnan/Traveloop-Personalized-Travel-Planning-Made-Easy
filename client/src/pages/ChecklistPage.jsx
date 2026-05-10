import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import defaultChecklist from '@/data/defaultChecklist.json';
import {
  ArrowLeft, Plus, Check, RotateCcw, Package, X, Search,
  SlidersHorizontal, Filter, ArrowUpDown, Share2, ChevronDown
} from 'lucide-react';

const CAT_ICONS = { clothing: '👕', documents: '📄', electronics: '🔌', toiletries: '🧴', other: '📦' };
const CAT_LABELS = { clothing: 'Clothing', documents: 'Documents', electronics: 'Electronics', toiletries: 'Toiletries', other: 'Other' };
const CATEGORIES = Object.keys(CAT_ICONS);

export default function ChecklistPage() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [tripId, setTripId] = useState(paramId);
  const [trips, setTrips] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: '', category: 'other' });

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('category');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [showToolbarDropdown, setShowToolbarDropdown] = useState(null);

  // Load trips for selector
  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.data)).catch(() => {});
  }, []);

  // Load checklist items
  useEffect(() => {
    setLoading(true);
    api.get(`/trips/${tripId}/checklist`).then(res => {
      if (res.data.length === 0) {
        const defaultItems = Object.entries(defaultChecklist).flatMap(([cat, names]) =>
          names.map(name => ({ itemName: name, category: cat }))
        );
        api.post(`/trips/${tripId}/checklist/bulk`, { items: defaultItems }).then(r => setItems(r.data)).finally(() => setLoading(false));
      } else {
        setItems(res.data);
        setLoading(false);
      }
    }).catch(() => { setLoading(false); });
  }, [tripId]);

  const togglePacked = async (item) => {
    try {
      const res = await api.put(`/checklist/${item.id}`, { isPacked: !item.isPacked });
      setItems(items.map(i => i.id === item.id ? res.data : i));
    } catch (err) { console.error(err); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.itemName) return;
    try {
      const res = await api.post(`/trips/${tripId}/checklist`, newItem);
      setItems([...items, res.data]);
      setNewItem({ itemName: '', category: 'other' });
      setShowAdd(false);
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/checklist/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (err) { console.error(err); }
  };

  const resetChecklist = async () => {
    try {
      const res = await api.post(`/trips/${tripId}/checklist/reset`);
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const shareChecklist = () => {
    const grouped = {};
    items.forEach(i => { (grouped[i.category] = grouped[i.category] || []).push(i); });
    let text = '📋 Packing Checklist\n\n';
    Object.entries(grouped).sort().forEach(([cat, catItems]) => {
      text += `${CAT_ICONS[cat] || '📦'} ${CAT_LABELS[cat] || cat}\n`;
      catItems.forEach(i => { text += `  ${i.isPacked ? '✅' : '⬜'} ${i.itemName}\n`; });
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    alert('Checklist copied to clipboard!');
  };

  // Filter, search, and sort
  const processedItems = useMemo(() => {
    let result = [...items];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.itemName.toLowerCase().includes(q));
    }

    // Filter
    if (filterBy === 'packed') result = result.filter(i => i.isPacked);
    if (filterBy === 'unpacked') result = result.filter(i => !i.isPacked);

    // Sort
    if (sortBy === 'name') result.sort((a, b) => a.itemName.localeCompare(b.itemName));
    if (sortBy === 'category') result.sort((a, b) => a.category.localeCompare(b.category));
    if (sortBy === 'status') result.sort((a, b) => Number(a.isPacked) - Number(b.isPacked));

    return result;
  }, [items, searchQuery, filterBy, sortBy]);

  // Group items
  const groupedItems = useMemo(() => {
    if (groupBy === 'none') return { 'All Items': processedItems };
    const g = {};
    processedItems.forEach(i => { (g[i.category] = g[i.category] || []).push(i); });
    return g;
  }, [processedItems, groupBy]);

  const packed = items.filter(i => i.isPacked).length;
  const total = items.length;
  const progress = total > 0 ? (packed / total) * 100 : 0;

  const handleTripChange = (newTripId) => {
    setTripId(newTripId);
    navigate(`/trips/${newTripId}/checklist`, { replace: true });
  };

  if (loading) return <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl"></div>)}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate(`/trips/${tripId}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trip
      </button>

      {/* Trip Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Select Trip</label>
        <select value={tripId} onChange={e => handleTripChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground">Packing Checklist</h1>
          <p className="text-muted-foreground">Progress: {packed}/{total} items packed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
          <button onClick={resetChecklist} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Reset All">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={shareChecklist} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Share Checklist">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="mb-6 p-5 rounded-2xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Packing Progress</span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Toolbar: Search, Group By, Filter, Sort */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl bg-surface border border-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        {/* Group By */}
        <div className="relative">
          <button onClick={() => setShowToolbarDropdown(showToolbarDropdown === 'group' ? null : 'group')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Group <ChevronDown className="w-3 h-3" />
          </button>
          {showToolbarDropdown === 'group' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[140px] animate-[scale-in_0.15s_ease-out]">
              {[['category', 'By Category'], ['none', 'No Grouping']].map(([val, label]) => (
                <button key={val} onClick={() => { setGroupBy(val); setShowToolbarDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${groupBy === val ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="relative">
          <button onClick={() => setShowToolbarDropdown(showToolbarDropdown === 'filter' ? null : 'filter')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3 h-3" />
          </button>
          {showToolbarDropdown === 'filter' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[140px] animate-[scale-in_0.15s_ease-out]">
              {[['all', 'All Items'], ['packed', 'Packed'], ['unpacked', 'Unpacked']].map(([val, label]) => (
                <button key={val} onClick={() => { setFilterBy(val); setShowToolbarDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterBy === val ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button onClick={() => setShowToolbarDropdown(showToolbarDropdown === 'sort' ? null : 'sort')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort <ChevronDown className="w-3 h-3" />
          </button>
          {showToolbarDropdown === 'sort' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[140px] animate-[scale-in_0.15s_ease-out]">
              {[['category', 'By Category'], ['name', 'By Name'], ['status', 'By Status']].map(([val, label]) => (
                <button key={val} onClick={() => { setSortBy(val); setShowToolbarDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === val ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categorized Items */}
      <div className="space-y-6">
        {Object.entries(groupedItems).sort().map(([group, groupItems]) => {
          const catPacked = groupItems.filter(i => i.isPacked).length;
          const catTotal = groupItems.length;
          const isCategory = groupBy === 'category';
          return (
            <div key={group} className="rounded-2xl bg-surface border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {isCategory && (CAT_ICONS[group] || '📦')} {isCategory ? (CAT_LABELS[group] || group) : group}
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {catPacked}/{catTotal}
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {groupItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group">
                    <button onClick={() => togglePacked(item)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${item.isPacked ? 'bg-emerald-500 border-emerald-500 text-white scale-110' : 'border-border hover:border-primary'}`}>
                      {item.isPacked && <Check className="w-4 h-4" />}
                    </button>
                    <span className={`flex-1 text-sm transition-all duration-200 ${item.isPacked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.itemName}</span>
                    {groupBy === 'none' && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{CAT_LABELS[item.category] || item.category}</span>
                    )}
                    <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {processedItems.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border mt-6">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold text-foreground mb-2">No items found</p>
          <p className="text-muted-foreground">{searchQuery ? 'Try a different search term' : 'Add items to your packing list'}</p>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <form onSubmit={addItem} onClick={e => e.stopPropagation()} className="bg-surface rounded-2xl p-6 w-full max-w-sm border border-border shadow-2xl space-y-4 animate-[scale-in_0.2s_ease-out]">
            <h3 className="font-bold text-foreground text-lg">Add Item to Checklist</h3>
            <input type="text" value={newItem.itemName} onChange={e => setNewItem({ ...newItem, itemName: e.target.value })} placeholder="Item name"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" autoFocus />
            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {CAT_LABELS[c]}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">Add Item</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
