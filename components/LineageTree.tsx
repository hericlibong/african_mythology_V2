
import React, { useMemo } from 'react';
import { MythologicalEntity } from '../types';
import { MYTHOLOGICAL_DB } from '../services/mockData';
// ArrowLeft imported but we will use text arrow for strict adherence to prompt if needed, 
// though SVG icon is cleaner. I will use the text arrow as requested in the specific text instruction.

interface LineageTreeProps {
  focusEntity: MythologicalEntity;
  onClose: () => void;
  onNodeClick: (entity: MythologicalEntity) => void;
}

// --- DATA HELPER ---
const findEntity = (name: string): MythologicalEntity | undefined => {
  return MYTHOLOGICAL_DB.find(e => e.name.toLowerCase() === name.toLowerCase());
};

// --- OLD SCHOOL STYLES (PRESERVED FOR RIGIDITY) ---
const styles = {
  table: {
    borderCollapse: 'collapse' as const,
    textAlign: 'center' as const,
    tableLayout: 'fixed' as const,
    margin: '0 auto', // Helps within flex item
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
    lineHeight: '1.2'
  },
  entityType: {
    fontSize: '10px',
    color: '#888',
    textTransform: 'uppercase' as const,
    display: 'block'
  },
  pivotText: {
    fontSize: '18px',
    textDecoration: 'underline',
    fontWeight: '900' as const,
    color: '#FFF'
  },
  // The "Pipes"
  vertLine: {
    width: '0px',
    height: '25px',
    borderLeft: '2px solid white',
    margin: '0 auto',
    display: 'block'
  },
  shortVertLine: {
    width: '0px',
    height: '10px',
    borderLeft: '2px solid white',
    margin: '0 auto',
    display: 'block'
  },
  horzBar: {
    height: '10px',
    borderTop: '2px solid white',
    width: '100%'
  },
  // New Label Style
  label: {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: '#D4AF37', // Gold/Amber
    fontWeight: 'bold' as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    display: 'block',
    padding: '2px 0'
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
      <div className="p-2 min-w-[140px]">
        <span style={isPivot ? styles.pivotText : { ...styles.entityName, color: isUnknown ? '#555' : 'white' }}>
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
    <div className="fixed inset-0 bg-black z-[100] overflow-auto text-white font-mono selection:bg-white selection:text-black">
      
      {/* 1. AGGRESSIVE NAVIGATION BUTTON (Forced Layout) - MONOSPACE UPDATE */}
      <button 
        onClick={onClose} 
        style={{
          position: 'fixed',
          top: '100px',
          left: '50px',
          zIndex: 9999,
          backgroundColor: '#1a1a1a',
          border: '2px solid #D4AF37',
          color: '#FFBF00',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          padding: '15px 30px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: 'monospace', // Changed to monospace
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 0 15px rgba(0,0,0,0.8)'
        }}
        className="hover:bg-[#FFBF00] hover:text-black transition-colors duration-300"
      >
        <span>←</span> BACK TO PROFILE
      </button>

      {/* 2. CENTERED CONTAINER (Flexbox Wrapper) */}
      <div className="min-h-screen flex flex-col items-center justify-center p-12 pt-24">
        
        {/* SUBTLE TITLE */}
        <div className="mb-12 text-center opacity-60">
           <span className="block text-[10px] font-mono uppercase tracking-[0.4em] text-stone-500 mb-2">
             Living Archive Record
           </span>
           <h2 className="font-serif text-xl md:text-2xl text-stone-300 tracking-widest uppercase border-b border-stone-800 pb-2 inline-block">
             Chronicle of {focusEntity.name}
           </h2>
        </div>

        {/* 3. THE RIGID TABLE (Structure preserved intact) */}
        <div className="overflow-x-auto max-w-full p-4 border border-stone-900/50 rounded-lg">
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
                  {renderEntity(focusEntity.name, true)}
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
                                  <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', borderTop: '2px solid white' }}></div>
                              )}
                              {!isFirst && (
                                  <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', borderTop: '2px solid white' }}></div>
                              )}
                              <div style={{ position: 'absolute', top: 0, left: '50%', height: '10px', borderLeft: '2px solid white' }}></div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Single Spouse Connector (Line before label) */}
                  {spouses.length === 1 && (
                    <tr>
                        <td colSpan={colCount} style={styles.cell}>
                          <div style={styles.shortVertLine}></div>
                        </td>
                    </tr>
                  )}

                  {/* Multiple Spouses Connectors (before label) */}
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
                        <div style={{ ...styles.vertLine, height: '15px' }}></div>
                        <span style={styles.label}>DESCENDANTS</span> 
                        <div style={{ ...styles.vertLine, height: '15px' }}></div> 
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
                                  {!isLast && <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', borderTop: '2px solid white' }}></div>}
                                  {!isFirst && <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', borderTop: '2px solid white' }}></div>}
                                  <div style={{ position: 'absolute', top: 0, left: '50%', height: '10px', borderLeft: '2px solid white' }}></div>
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
                            <td key={child} colSpan={spanPerChild} style={{...styles.cell, paddingTop: '5px'}}>
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

        {/* ASCII DECORATION FOOTER */}
        <div className="mt-16 text-center">
           <span className="text-[10px] text-stone-700 font-mono tracking-widest">
             [ END OF GENEALOGICAL RECORD ]
           </span>
        </div>

      </div>
    </div>
  );
};

export default LineageTree;
