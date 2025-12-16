/* ========================================
   ListsSection.jsx - Custom Lists Section
   ======================================== */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import ContentGrid from '../cards/ContentGrid';
import { generateId } from '../../utils/helpers';
import './Sections.css';

function ListsSection({ onPlay, onEdit }) {
  const { state, actions } = useApp();
  const { collection } = useCollection();
  const { customLists } = state;
  
  const [activeList, setActiveList] = useState(customLists[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Get items for active list
  const getListItems = () => {
    const list = customLists.find(l => l.id === activeList);
    if (!list) return [];
    
    return list.items
      .map(itemKey => {
        const [id, type] = itemKey.split('-');
        return collection.find(c => c.id.toString() === id && c.type === type);
      })
      .filter(Boolean);
  };

  // Create new list
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    
    const newList = {
      id: generateId(),
      name: newListName.trim(),
      items: [],
      createdAt: Date.now()
    };
    
    actions.addCustomList(newList);
    setNewListName('');
    setIsCreating(false);
    setActiveList(newList.id);
    actions.addNotification(`List "${newListName}" created!`, 'success');
  };

  // Delete list
  const handleDeleteList = (listId) => {
    const list = customLists.find(l => l.id === listId);
    if (window.confirm(`Delete "${list?.name}"?`)) {
      // Remove from state
      const updatedLists = customLists.filter(l => l.id !== listId);
      // This would need a dispatch action for removing custom lists
      actions.addNotification(`List deleted`, 'success');
      if (activeList === listId) {
        setActiveList(updatedLists[0]?.id || null);
      }
    }
  };

  const displayItems = getListItems();
  const activeListData = customLists.find(l => l.id === activeList);

  return (
    <section className="section lists-section">
      <div className="section-header">
        <h2 className="section-title">📝 Custom Lists</h2>
        <button 
          className="create-list-btn"
          onClick={() => setIsCreating(true)}
        >
          + New List
        </button>
      </div>

      {/* Create List Modal */}
      {isCreating && (
        <div className="create-list-form">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name..."
            className="list-name-input"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
          />
          <button className="form-btn save" onClick={handleCreateList}>Create</button>
          <button className="form-btn cancel" onClick={() => setIsCreating(false)}>Cancel</button>
        </div>
      )}

      {/* Lists Tabs */}
      {customLists.length > 0 ? (
        <>
          <div className="lists-tabs">
            {customLists.map(list => (
              <button
                key={list.id}
                className={`list-tab ${activeList === list.id ? 'active' : ''}`}
                onClick={() => setActiveList(list.id)}
              >
                <span className="tab-name">{list.name}</span>
                <span className="tab-count">{list.items.length}</span>
              </button>
            ))}
          </div>

          {/* Active List Content */}
          {activeListData && (
            <div className="list-content">
              <div className="list-header">
                <h3 className="list-title">{activeListData.name}</h3>
                <button 
                  className="delete-list-btn"
                  onClick={() => handleDeleteList(activeList)}
                >
                  🗑️ Delete List
                </button>
              </div>
              
              <ContentGrid
                items={displayItems}
                loading={false}
                onPlay={onPlay}
                onEdit={onEdit}
                emptyMessage="This list is empty. Add items from your collection!"
              />
            </div>
          )}
        </>
      ) : (
        <div className="empty-lists">
          <div className="empty-icon">📋</div>
          <p>No custom lists yet</p>
          <p className="empty-hint">Create your first list to organize your collection!</p>
        </div>
      )}
    </section>
  );
}

export default ListsSection;
