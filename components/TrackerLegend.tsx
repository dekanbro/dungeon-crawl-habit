export default function TrackerLegend() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-md">
      <h3 className="text-xl font-serif text-primary mb-3">Legend</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-stone-800 border border-stone-700 rounded-sm"></div>
          <span className="text-sm">No Activity</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative bg-stone-800 border border-stone-700 rounded-sm after:content-[''] after:absolute after:inset-0 after:bg-[url('/cobweb.svg')] after:opacity-40"></div>
          <span className="text-sm">Broken Streak</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-stone-700 border border-amber-900/50 shadow-[inset_0_0_6px_rgba(251,191,36,0.2)] rounded-sm"></div>
          <span className="text-sm">1 Day</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative bg-stone-700 border border-amber-600/50 shadow-[inset_0_0_8px_rgba(251,191,36,0.4)] rounded-sm after:content-[''] after:absolute after:inset-0 after:bg-[url('/glyph.svg')] after:opacity-40"></div>
          <span className="text-sm">2-3 Days</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative bg-stone-600 border border-amber-500/70 shadow-[inset_0_0_12px_rgba(251,191,36,0.6)] rounded-sm after:content-[''] after:absolute after:inset-1 after:bg-[url('/runes.svg')] after:opacity-60"></div>
          <span className="text-sm">4+ Days</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative bg-stone-700 border border-amber-500 shadow-[inset_0_0_10px_rgba(245,158,11,0.4)] rounded-sm after:content-[''] after:absolute after:inset-0 after:bg-[url('/dragon-weakened.svg')] after:bg-center after:bg-no-repeat after:bg-contain"></div>
          <span className="text-sm">Boss</span>
        </div>
      </div>
    </div>
  );
}