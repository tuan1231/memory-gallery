"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform, useMotionValue } from "motion/react";
import MasonryItem from "./MasonryItem";
import ScrollRevealGrid from "./ScrollRevealGrid";
import Image from "next/image";

function MonthCalendar({ monthData }) {
  const { year, month, stories, daysMap } = monthData;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  return (
    <div className="mb-32">
      <div className="flex items-end justify-between mb-8 border-b border-border/30 pb-4">
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
          {monthNames[month]} {year}
        </h3>
        <p className="text-foreground/50 font-medium uppercase tracking-[0.15em] text-xs pb-1">
          {stories.length} Ký ức
        </p>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-16 max-w-4xl mx-auto">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">{d}</div>
        ))}
        {blanks.map(b => <div key={`b-${b}`} className="aspect-square rounded-xl bg-transparent"></div>)}
        
        {daysArray.map(day => {
          const hasStory = !!daysMap[day];
          const story = daysMap[day];
          
          return (
            <div key={day} className={`relative aspect-square rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center border transition-all duration-300 ${hasStory ? 'border-accent/40 shadow-xl shadow-accent/10 cursor-pointer hover:scale-110 hover:z-20 z-10' : 'border-border/10 bg-foreground/5 opacity-40'}`}>
               {!hasStory && <span className="text-[10px] md:text-xs font-bold text-foreground/30">{day}</span>}
               
               {hasStory && story.image_url && (
                 <>
                   <Image src={story.image_url} alt="" fill sizes="100px" quality={50} className="object-cover" />
                   <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors"></div>
                 </>
               )}
               {hasStory && !story.image_url && (
                 <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                   <span className="text-lg md:text-2xl">💗</span>
                 </div>
               )}
               {hasStory && <span className="absolute bottom-1 right-2 text-white text-[10px] md:text-xs font-black z-10 drop-shadow-md">{day}</span>}
            </div>
          );
        })}
      </div>
      
      {/* Cards for this month */}
      <ScrollRevealGrid className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
        {stories.map(s => <MasonryItem key={s.id} story={s} />)}
      </ScrollRevealGrid>
    </div>
  );
}

// Normal Card for a single story
function StoryCard({ story, dateStr }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link 
      href={`/story/${story.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="block perspective-[1200px]"
    >
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full bg-card-bg/50 backdrop-blur-md rounded-3xl shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-border/50 p-4 md:p-5 group"
      >
        <div className="relative rounded-2xl overflow-hidden bg-foreground/5 aspect-[4/5] sm:aspect-[4/3] md:aspect-[4/5] lg:aspect-square">
          {story.image_url ? (
            <Image
              src={story.image_url} 
              alt={story.title || 'Memory'} 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-8 bg-card-bg/80 text-center border-b border-border/10">
              <span className="text-4xl mb-4 opacity-50">💗</span>
              <p className="text-foreground/50 text-sm font-medium italic line-clamp-3">
                {story.content || story.title || "Text memory"}
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <div 
            style={{ transform: "translateZ(40px)" }}
            className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none flex justify-between items-end"
          >
            <span className="text-white text-lg font-bold tracking-tight drop-shadow-md bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
              View Memory
            </span>
          </div>
        </div>

        <div className="mt-6 px-2 flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold tracking-tighter text-foreground leading-none">{dateStr}</span>
            <div className="flex-1 h-px bg-border/50"></div>
          </div>
          <h4 className="text-xl font-bold text-foreground/90 tracking-tight leading-snug line-clamp-2">
            {story.title}
          </h4>
          {story.content && (
            <p className="text-sm text-foreground/60 line-clamp-2 mt-1 leading-relaxed">
              {story.content}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

// Stacked Card for multiple stories on the same day
function StackedStoryCard({ stories, dateStr, onSelect }) {
  const displayStories = stories.slice(0, 3);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="block perspective-[1200px] cursor-pointer"
    >
      <motion.div 
        initial="rest"
        whileHover="hover"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full bg-card-bg/50 backdrop-blur-md rounded-3xl shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-border/50 p-4 md:p-5 group"
      >
        <div className="relative aspect-[4/5] sm:aspect-[4/3] md:aspect-[4/5] lg:aspect-square w-full">
          {[...displayStories].reverse().map((story, reversedIndex) => {
            const originalIndex = displayStories.length - 1 - reversedIndex;
            const isTop = originalIndex === 0;
            
            const variants = {
              rest: {
                rotate: originalIndex === 1 ? -4 : originalIndex === 2 ? 6 : 0,
                x: originalIndex === 1 ? -8 : originalIndex === 2 ? 10 : 0,
                y: originalIndex === 1 ? 12 : originalIndex === 2 ? 8 : 0,
                scale: originalIndex === 1 ? 0.96 : originalIndex === 2 ? 0.92 : 1,
              },
              hover: {
                rotate: originalIndex === 1 ? -12 : originalIndex === 2 ? 14 : 0,
                x: originalIndex === 1 ? -45 : originalIndex === 2 ? 45 : 0,
                y: originalIndex === 1 ? -10 : originalIndex === 2 ? -2 : 0,
                scale: isTop ? 1.05 : originalIndex === 1 ? 1 : 0.96,
              }
            };

            return (
              <motion.div
                key={story.id}
                variants={variants}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`absolute inset-0 rounded-2xl overflow-hidden shadow-lg border border-border/20 ${isTop ? 'z-20 bg-foreground/5' : 'z-10 bg-card-bg'}`}
              >
                {story.image_url ? (
                  <Image 
                    src={story.image_url} 
                    alt="Memory Stack" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw" 
                    quality={85} 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-card-bg/80 text-center">
                    <span className="text-3xl mb-2 opacity-50">💗</span>
                  </div>
                )}
                {isTop && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                )}
              </motion.div>
            );
          })}
          
          <div 
            style={{ transform: "translateZ(40px)" }}
            className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none flex justify-between items-end z-30"
          >
            <span className="text-white text-lg font-bold tracking-tight drop-shadow-md bg-black/20 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
              View Stack 
              <span className="bg-white text-black text-xs font-black px-2 py-0.5 rounded-full">{stories.length}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 px-2 flex flex-col gap-2 relative z-30">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold tracking-tighter text-foreground leading-none">{dateStr}</span>
            <div className="flex-1 h-px bg-border/50"></div>
          </div>
          <h4 className="text-xl font-bold text-foreground/90 tracking-tight leading-snug line-clamp-2">
            {displayStories[0].title}
          </h4>
          <p className="text-sm text-accent font-semibold mt-1 flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            + {stories.length - 1} more memories
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function MemoryTimeline({ stories }) {
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'calendar'

  const calendarMonths = useMemo(() => {
    const grouped = {};
    [...stories].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(story => {
      const d = new Date(story.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!grouped[key]) {
        grouped[key] = {
          year: d.getFullYear(),
          month: d.getMonth(),
          stories: [],
          daysMap: {}
        };
      }
      grouped[key].stories.push(story);
      grouped[key].daysMap[d.getDate()] = story;
    });
    return Object.values(grouped);
  }, [stories]);

  const nodes = useMemo(() => {
    // Chronological order (oldest first)
    const sorted = [...stories].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const result = [];
    
    // Group by exact day mapping
    const dayGroupsMap = new Map();
    
    sorted.forEach(story => {
      const date = new Date(story.created_at);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!dayGroupsMap.has(dayKey)) {
        dayGroupsMap.set(dayKey, { date, stories: [] });
      }
      dayGroupsMap.get(dayKey).stories.push(story);
    });

    let currentMonthKey = null;
    let groupCount = 0;

    // Convert to nodes
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    for (const [dayKey, group] of dayGroupsMap.entries()) {
      const date = group.date;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (monthKey !== currentMonthKey) {
        result.push({
          type: 'month',
          id: `month-${monthKey}`,
          label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        });
        currentMonthKey = monthKey;
      }

      result.push({
        type: 'day',
        id: `day-${dayKey}`,
        stories: group.stories,
        side: groupCount % 2 === 0 ? 'left' : 'right',
        dateStr: `Day ${date.getDate()}`,
        fullDateStr: `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
      });
      
      groupCount++;
    }

    return result;
  }, [stories]);

  const curveParams = useMemo(() => {
    const params = [];
    
    // Calculate offsets (startX) for all nodes
    const dxs = nodes.map((node, i) => {
      // amplitude max ~35px offset
      const amplitude = node.type === 'month' ? 15 : 35;
      return Math.sin(i * 1.4) * amplitude;
    });
    
    let prevCx2 = 0;
    for (let i = 0; i < nodes.length; i++) {
      const startX = dxs[i];
      const endX = i < nodes.length - 1 ? dxs[i+1] : 0;
      
      // Ensure C1 continuity: next curve's first control point is a reflection 
      // of previous curve's second control point across the joining dot.
      const cx1 = i === 0 ? startX : 2 * startX - prevCx2;
      
      // Randomish but bounded cx2
      let cx2 = endX + Math.cos(i * 0.9) * 45;
      if (cx2 > 45) cx2 = 45;
      if (cx2 < -45) cx2 = -45;
      
      params.push({ startX, endX, cx1, cx2 });
      prevCx2 = cx2;
    }
    return params;
  }, [nodes]);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedDayId && n.type === 'day');
  }, [nodes, selectedDayId]);

  if (!stories || stories.length === 0) return null;

  // Render Day Detail View
  if (selectedNode) {
    return (
      <div className="w-full max-w-7xl mx-auto pb-32 px-4 sm:px-8 mt-4 md:mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-border/30 pb-8">
          <div>
            <button 
              onClick={() => setSelectedDayId(null)}
              className="text-foreground/60 hover:text-foreground font-medium transition-colors uppercase tracking-[0.1em] text-xs mb-6 flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Timeline
            </button>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
              {selectedNode.fullDateStr}
            </h2>
          </div>
          <p className="text-foreground/50 font-medium uppercase tracking-[0.15em] text-xs pb-1 border-b border-accent/30">
            {selectedNode.stories.length} {selectedNode.stories.length === 1 ? 'Moment' : 'Moments'}
          </p>
        </div>
        
        <ScrollRevealGrid className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {selectedNode.stories.map(story => (
            <MasonryItem key={story.id} story={story} />
          ))}
        </ScrollRevealGrid>
      </div>
    );
  }

  const monthNodes = nodes.filter(n => n.type === 'month');

  // Render Main View
  return (
    <div className="w-full max-w-7xl mx-auto pb-32 px-4 sm:px-8 relative">
      
      {/* View Mode Toggle */}
      <div className="flex justify-center mb-16 relative z-20">
        <div className="bg-foreground/5 p-1.5 rounded-full flex items-center backdrop-blur-md border border-border/50">
          <button 
            onClick={() => setViewMode('timeline')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${viewMode === 'timeline' ? 'bg-foreground text-background shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Hành Trình
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${viewMode === 'calendar' ? 'bg-foreground text-background shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Lịch Ký Ức
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="w-full mt-8">
          {calendarMonths.map((monthData, idx) => (
            <MonthCalendar key={idx} monthData={monthData} />
          ))}
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto relative">
          
          {/* Floating Timeline Navigator */}
          {monthNodes.length > 0 && (
            <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 bg-background/60 backdrop-blur-md p-3 rounded-full border border-border/50 shadow-xl">
              {monthNodes.map(node => (
                <button
                  key={`nav-${node.id}`}
                  onClick={() => {
                    document.getElementById(node.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-foreground/20 hover:bg-accent transition-all group relative"
                >
                  <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                    {node.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-8 md:gap-16 pt-8 relative z-10">
        {nodes.map((node, i) => {
          const params = curveParams[i];
          
          if (node.type === 'month') {
            return (
              <motion.div 
                key={node.id}
                id={node.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-24 flex items-center justify-center my-4"
              >
                {/* Wavy line down to next element */}
                <svg 
                  className="absolute top-12 left-[28px] md:left-1/2 w-[100px] -translate-x-1/2 h-[calc(100%+2rem)] md:h-[calc(100%+4rem)] z-0 pointer-events-none text-border/40" 
                  viewBox="-50 0 100 100" 
                  preserveAspectRatio="none"
                >
                  <path 
                    d={`M ${params.startX} 0 C ${params.cx1} 33, ${params.cx2} 66, ${params.endX} 100`} 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="transparent" 
                    strokeDasharray="5 5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div 
                  className="absolute left-[28px] md:left-1/2 top-12 z-10 bg-background/80 backdrop-blur-md border border-border px-6 py-2.5 rounded-full shadow-sm text-xs font-bold tracking-[0.2em] uppercase text-foreground whitespace-nowrap"
                  style={{ transform: `translate(calc(-50% + ${params.startX}px), -50%)` }}
                >
                  {node.label}
                </div>
              </motion.div>
            );
          }

          const isLeft = node.side === 'left';

          return (
            <motion.div 
              key={node.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative w-full group flex"
            >
              {/* Wavy line down to next element */}
              <svg 
                className="absolute top-12 left-[28px] md:left-1/2 w-[100px] -translate-x-1/2 h-[calc(100%+2rem)] md:h-[calc(100%+4rem)] z-0 pointer-events-none text-border/40" 
                viewBox="-50 0 100 100" 
                preserveAspectRatio="none"
              >
                <path 
                  d={`M ${params.startX} 0 C ${params.cx1} 33, ${params.cx2} 66, ${params.endX} 100`} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="transparent" 
                  strokeDasharray="5 5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Timeline Dot */}
              <div 
                className="absolute top-12 left-[28px] md:left-1/2 w-[14px] h-[14px] rounded-full border-[3px] border-background bg-foreground z-10 shadow-sm transition-transform duration-300 group-hover:scale-[1.4] group-hover:bg-accent"
                style={{ transform: `translate(calc(-50% + ${params.startX}px), -50%)` }}
              ></div>
              
              {/* Connector Line (Desktop only) */}
              <div 
                className={`hidden md:block absolute top-12 h-0 border-t-[2px] border-dashed border-border/40 transition-all duration-500 group-hover:border-accent/60 z-0`}
                style={{
                  right: isLeft ? `calc(50% - ${params.startX}px)` : 'auto',
                  left: isLeft ? 'auto' : `calc(50% + ${params.startX}px)`,
                  width: `calc(40px + ${isLeft ? params.startX : -params.startX}px)`,
                }}
              ></div>
              
              {/* Card Container */}
              <div 
                className={`relative z-20 w-[calc(100%-3rem)] ml-16 md:w-[calc(50%-2.5rem-2rem)] lg:md:w-[calc(50%-2.5rem-4rem)] ${
                  isLeft ? 'md:ml-0 md:mr-auto' : 'md:ml-auto md:mr-0'
                }`}
              >
                {node.stories.length === 1 ? (
                  <StoryCard story={node.stories[0]} dateStr={node.dateStr} isLeft={isLeft} />
                ) : (
                  <StackedStoryCard 
                    stories={node.stories} 
                    dateStr={node.dateStr} 
                    onSelect={() => setSelectedDayId(node.id)} 
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* End of journey marker */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative w-full h-32 flex justify-start md:justify-center mt-8 md:mt-16"
      >
        <div 
          className="absolute left-[28px] md:left-1/2 w-3 h-3 rounded-full border-[2px] border-border bg-transparent top-12 z-10"
          style={{ transform: `translate(-50%, -50%)` }}
        ></div>
        <div className="pl-16 md:pl-0 text-foreground/40 text-xs font-bold tracking-[0.2em] uppercase mt-12 text-center w-full">
          The journey continues...
        </div>
      </motion.div>
        </div>
      )}
    </div>
  );
}
