
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

// --- STYLES (INLINE FOR OLD SCHOOL PURITY) ---
const styles = {
  container: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontFamily: '"Courier New", Courier, monospace',
    overflow: 'auto',
    zIndex: 100,
    padding: '20px'
  },
  header: {
    marginBottom: '20px',
    borderBottom: '1px solid #333',
    paddingBottom: '10px',
    display: 'block'
  },
  backBtn: {
    background: 'none',
    border: '1px solid white',
    color: 'white',
    padding: '5px 10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    width: 'fit-content'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '20px',
    textAlign: 'center' as const,
    tableLayout: 'fixed' as const, // Strict columns
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
    height: '20px',
    borderLeft: '2px solid white',
    margin: '0 auto',
    display: 'block'
  },
  vertLineDashed: {
    width: '0px',
    height: '20px',
    borderLeft: '2px dashed #555',
    margin: '0 auto',
    display: 'block'
  },
  horzBar: {
    height: '10px', // The bar is at the bottom
    borderTop: '2px solid white',
    width: '100%'
  }
};

const LineageTree: React.FC<LineageTreeProps> = ({ focusEntity, onClose }) => {

  const { parents, spouses, children, colCount } = useMemo(() => {
    const _parents = focusEntity.relations.parents;
    const _spouses = focusEntity.relations.conjoint;
    const _children = focusEntity.relations.descendants;
    
    // We need a grid wide enough to hold the widest row.
    // To ensure perfect centering, we use 2 columns per item.
    // Example: 3 spouses = 6 columns. 
    // Spouse 1 takes cols 1-2, Spouse 2 takes 3-4, Spouse 3 takes 5-6.
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
      <div style={{ padding: '5px' }}>
        <span style={isPivot ? styles.pivotText : { ...styles.entityName, color: isUnknown ? '#666' : 'white' }}>
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
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backBtn}>
          <ArrowLeft size={12} /> BACK_TO_CARD
        </button>
      </div>

      {/* THE TABLE */}
      <table style={styles.table}>
        <tbody>

          {/* --- LEVEL 1: PARENTS --- */}
          {parents.length > 0 && (
            <>
              <tr>
                <td colSpan={colCount} style={styles.cell}>
                  {parents.map((p, i) => (
                    <span key={p} style={{ display: 'inline-block', margin: '0 10px' }}>
                      {renderEntity(p)}
                    </span>
                  ))}
                </td>
              </tr>
              {/* Connector from Parent Down */}
              <tr>
                <td colSpan={colCount} style={styles.cell}>
                   <div style={styles.vertLine}></div>
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

          {/* --- LEVEL 3: SPOUSES (The tricky part) --- */}
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
                    
                    // Each spouse gets 2 columns in the grid logic, but here we just need cells for the bus.
                    // Let's assume the table for this row has `spouses.length` cells
                    // But our main table has `colCount` columns.
                    // We need to span properly.
                    const spanPerSpouse = colCount / spouses.length;

                    // Inner logic for the line:
                    // ┌ (First)  ─┬─ (Middle)  ┐ (Last)
                    // We simulate this with border-top on a div inside the cell
                    
                    return (
                      <td key={i} colSpan={spanPerSpouse} style={styles.cell}>
                        <div style={{ position: 'relative', height: '10px', width: '100%' }}>
                           {/* Horizontal Line: Needs to go from Center of this cell... to... */}
                           {/* Actually, simplified ASCII logic: 
                               Full width top border for middle items.
                               Right half for first item.
                               Left half for last item.
                           */}
                           
                           {/* Right Half Line (for First and Middle) */}
                           {!isLast && (
                              <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', borderTop: '2px solid white' }}></div>
                           )}
                           
                           {/* Left Half Line (for Last and Middle) */}
                           {!isFirst && (
                              <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', borderTop: '2px solid white' }}></div>
                           )}

                           {/* Vertical Down Tick */}
                           <div style={{ position: 'absolute', top: 0, left: '50%', height: '10px', borderLeft: '2px solid white' }}></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* Just a vertical line if only 1 spouse */}
              {spouses.length === 1 && (
                 <tr>
                    <td colSpan={colCount} style={styles.cell}>
                       <div style={styles.vertLine}></div>
                    </td>
                 </tr>
              )}

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
               {/* Gap / Vertical Line Sequence */}
               <tr>
                 {/* Determine where lines come from. 
                     Prompt implies children are below partners.
                     We will draw lines from partners down? 
                     Or just a central trunk if we don't know who the parent is? 
                     Let's do a central trunk from the "Family Unit" above.
                 */}
                 <td colSpan={colCount} style={styles.cell}>
                    <div style={{ ...styles.vertLine, height: '40px' }}></div> 
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

      {/* ASCII DECORATION FOOTER */}
      <div style={{ marginTop: '50px', borderTop: '1px dashed #333', paddingTop: '10px', textAlign: 'center', color: '#444', fontSize: '10px' }}>
         END OF LINEAGE RECORD [EOF]
      </div>

    </div>
  );
};

export default LineageTree;
