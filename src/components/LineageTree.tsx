
import React, { useMemo } from 'react';
import { MythologicalEntity } from '../types';
import { MYTHOLOGICAL_DB } from '../services/mockData';
import { ArrowLeft } from 'lucide-react';

interface LineageTreeProps {
  focusEntity: MythologicalEntity;
  onClose: () => void;
  onNodeClick: (entity: MythologicalEntity) => void;
}

// --- DATA HELPER ---
const findEntity = (name: string): MythologicalEntity | undefined => {
  return MYTHOLOGICAL_DB.find(e => e.name.toLowerCase() === name.toLowerCase());
};

// --- STYLES (Kept for table structure logic, but updated colors to use CSS variables where possible or strict hexes) ---
const styles = {
  table: {
    borderCollapse: 'collapse' as const,
    textAlign: 'center' as const,
    tableLayout: 'fixed' as const,
    margin: '0 auto',
    minWidth: '100%',
  },
  cell: {
    padding: '0',
    verticalAlign: 'top' as const,
    position: 'relative' as const,
  },
  entityName: {
    fontWeight: 'bold' as const,
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    display: 'block',
    lineHeight: '1.2',
    fontFamily: 'monospace' // Enforced Monospace
  },
  entityType: {
    fontSize: '9px',
    color: '#78716c', // stone-500
    textTransform: 'uppercase' as const,
    display: 'block',
    fontFamily: 'monospace',
    marginTop: '2px'
  },
  pivotText: {
    fontSize: '16px',
    textDecoration: 'underline',
    textDecorationColor: '#FFBF00', // Gold
    fontWeight: '900' as const,
    color: '#FFF',
    fontFamily: 'monospace',
    textTransform: 'uppercase' as const,
  },
  // The "Pipes"
  vertLine: {
    width: '0px',
    height: '30px',
    borderLeft: '1px solid #57534e', // Thinner, stone-600
    margin: '0 auto',
    display: 'block'
  },
  shortVertLine: {
    width: '0px',
    height: '15px',
    borderLeft: '1px solid #57534e',
    margin: '0 auto',
    display: 'block'
  },
  // New Label Style
  label: {
    fontFamily: 'monospace',
    fontSize: '9px',
    color: '#FFBF00', // Gold
    fontWeight: 'bold' as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    display: 'block',
    padding: '4px 0',
    opacity: 0.8
  }
};

const LineageTree: React.FC<LineageTreeProps> = ({ focusEntity, onClose }) => {

  const { parents, spouses, children, colCount } = useMemo(() => {
    const _parents = focusEntity.relations.parents;
    const _spouses = focusEntity.relations.conjoint;
    const _children = focusEntity.relations.descendants;
    
    // Grid Logic: 2 columns per item to allow for perfect centering and half-borders
    const maxItems = Math.max(_spouses.length, _children.length, 1);
    const cols = maxItems * 2;
    
    return {
      parents: _parents,
      spouses: _spouses,
      children: _children,
      colCount: cols
    };
  }, [focusEntity]);

  // Render a Single Entity Text Block
  const renderEntity = (name: string, isPivot = false) => {
    const entity = findEntity(name);
    const isUnknown = !entity && !isPivot;
    
    return (
      <div className="p-2 min-w-[140px] group transition-all duration-300 hover:scale-105 cursor-default">
        <span style={isPivot ? styles.pivotText : { ...styles.entityName, color: isUnknown ? '#57534e' : '#e7e5e4' }}>
          {name}
        </span>
        <span style={styles.entityType}>
          {isPivot 
             ? `(${focusEntity.entity_type})` 
             : entity 
               ? `(${entity.entity_type})` 
               : '(UNKNOWN)'}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-md z-[100] overflow-y-auto overflow-x-hidden text-stone-200 animate-fadeIn">
      
      {/* 1. ELEGANT BACK BUTTON */}
      <button 
        onClick={onClose} 
        className="fixed top-24 left-6 z-50 flex items-center gap-3 px-4 py-2 bg-stone-900/80 border border-gold/30 hover:border-gold hover:bg-gold hover:text-stone-950 text-gold transition-all duration-300 rounded-sm font-mono text-xs tracking-widest uppercase shadow-lg backdrop-blur-sm"
      >
        <ArrowLeft size={14} />
        <span>Back to Profile</span>
      </button>

      {/* 2. CENTERED CONTAINER */}
      <div className="min-h-screen flex flex-col items-center justify-center py-24 px-4 md:px-12">
        
        {/* TITLE SECTION */}
        <div className="mb-16 text-center">
           <span className="block text-[10px] font-mono uppercase tracking-[0.4em] text-stone-500 mb-3">
             Genealogical Record
           </span>
           <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-200 uppercase tracking-widest border-b border-stone-800 pb-4 inline-block">
             Chronicle of <span className="text-gold">{focusEntity.name}</span>
           </h2>
        </div>

        {/* 3. RESPONSIVE TABLE WRAPPER */}
        <div className="w-full max-w-full overflow-x-auto pb-12 custom-scrollbar flex justify-center">
          <div className="min-w-max px-8 py-8 border border-stone-800/50 bg-stone-900/30 rounded-xl shadow-2xl">
            <table style={styles.table}>
              <tbody>

                {/* --- LEVEL 1: PARENTS --- */}
                {parents.length > 0 && (
                  <>
                    {/* Parent Names */}
                    <tr>
                      <td colSpan={colCount} style={styles.cell}>
                        {parents.map((p, i) => (
                          <span key={p} style={{ display: 'inline-block', margin: '0 20px' }}>
                            {renderEntity(p)}
                          </span>
                        ))}
                      </td>
                    </tr>
                    
                    {/* Label: PARENTS */}
                    <tr>
                      <td colSpan={colCount} style={styles.cell}>
                          <div style={styles.shortVertLine}></div>
                          <span style={styles.label}>PARENTS</span>
                          <div style={styles.shortVertLine}></div>
                      </td>
                    </tr>
                  </>
                )}

                {/* --- LEVEL 2: PIVOT --- */}
                <tr>
                  <td colSpan={colCount} style={styles.cell}>
                    <div className="py-2">
                      {renderEntity(focusEntity.name, true)}
                    </div>
                  </td>
                </tr>

                {/* --- LEVEL 3: SPOUSES & BUS --- */}
                {spouses.length > 0 && (
                  <>
                    {/* Connector Down from Pivot */}
                    <tr>
                      <td colSpan={colCount} style={styles.cell}>
                        <div style={styles.vertLine}></div>
                      </td>
                    </tr>
                    
                    {/* The "Bus" (Horizontal Line) */}
                    {spouses.length > 1 && (
                      <tr>
                        {Array.from({ length: spouses.length }).map((_, i) => {
                          const isFirst = i === 0;
                          const isLast = i === spouses.length - 1;
                          const spanPerSpouse = colCount / spouses.length;
                          
                          return (
                            <td key={i} colSpan={spanPerSpouse} style={styles.cell}>
                              <div style={{ position: 'relative', height: '10px', width: '100%' }}>
                                {!isLast && (
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', borderTop: '1px solid #57534e' }}></div>
                                )}
                                {!isFirst && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', borderTop: '1px solid #57534e' }}></div>
                                )}
                                <div style={{ position: 'absolute', top: 0, left: '50%', height: '10px', borderLeft: '1px solid #57534e' }}></div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    )}

                    {/* Single Spouse Connector */}
                    {spouses.length === 1 && (
                      <tr>
                          <td colSpan={colCount} style={styles.cell}>
                            <div style={styles.shortVertLine}></div>
                          </td>
                      </tr>
                    )}

                    {/* Multiple Spouses Connectors */}
                    {spouses.length > 1 && (
                       <tr>
                          {spouses.map((_, i) => {
                               const spanPerSpouse = colCount / spouses.length;
                               return (
                                   <td key={i} colSpan={spanPerSpouse} style={styles.cell}>
                                       <div style={styles.shortVertLine}></div>
                                   </td>
                               );
                          })}
                       </tr>
                    )}

                    {/* LABEL ROW: PARTNER */}
                    <tr>
                      {spouses.map((spouse, i) => {
                        const spanPerSpouse = colCount / spouses.length;
                        return (
                          <td key={`label-${i}`} colSpan={spanPerSpouse} style={styles.cell}>
                             <span style={styles.label}>PARTNER</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Connector after label */}
                     <tr>
                      {spouses.map((_, i) => {
                        const spanPerSpouse = colCount / spouses.length;
                        return (
                          <td key={`conn-${i}`} colSpan={spanPerSpouse} style={styles.cell}>
                            <div style={styles.shortVertLine}></div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* The Spouse Names */}
                    <tr>
                      {spouses.map((spouse, i) => {
                        const spanPerSpouse = colCount / spouses.length;
                        return (
                          <td key={spouse} colSpan={spanPerSpouse} style={styles.cell}>
                            {renderEntity(spouse)}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}

                {/* --- LEVEL 4: CHILDREN --- */}
                {children.length > 0 && (
                  <>
                    {/* Label Sequence: Line -> Label -> Line -> Bus */}
                    <tr>
                      <td colSpan={colCount} style={styles.cell}>
                          <div style={{ ...styles.vertLine, height: '20px' }}></div>
                          <span style={styles.label}>CHILD</span> 
                          <div style={{ ...styles.vertLine, height: '20px' }}></div> 
                      </td>
                    </tr>

                    {/* The "Bus" for Children */}
                    {children.length > 1 && (
                      <tr>
                          {Array.from({ length: children.length }).map((_, i) => {
                            const isFirst = i === 0;
                            const isLast = i === children.length - 1;
                            const spanPerChild = colCount / children.length;

                            return (
                              <td key={i} colSpan={spanPerChild} style={styles.cell}>
                                  <div style={{ position: 'relative', height: '10px', width: '100%' }}>
                                    {!isLast && <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', borderTop: '1px solid #57534e' }}></div>}
                                    {!isFirst && <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', borderTop: '1px solid #57534e' }}></div>}
                                    <div style={{ position: 'absolute', top: 0, left: '50%', height: '10px', borderLeft: '1px solid #57534e' }}></div>
                                  </div>
                              </td>
                            );
                          })}
                      </tr>
                    )}
                    
                    {/* Single Child Connector */}
                    {children.length === 1 && (
                      <tr><td colSpan={colCount} style={styles.cell}><div style={styles.vertLine}></div></td></tr>
                    )}

                    {/* Children Names */}
                    <tr>
                        {children.map((child, i) => {
                          const spanPerChild = colCount / children.length;
                          return (
                              <td key={child} colSpan={spanPerChild} style={{...styles.cell, paddingTop: '10px'}}>
                                {renderEntity(child)}
                              </td>
                          );
                        })}
                    </tr>
                  </>
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* ASCII DECORATION FOOTER */}
        <div className="mt-12 text-center opacity-50 hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-stone-600 font-mono tracking-widest">
             /// END OF RECORD ///
           </span>
        </div>

      </div>
    </div>
  );
};

export default LineageTree;
