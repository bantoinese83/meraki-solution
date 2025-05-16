'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const PALETTE = [
  { type: 'logo', label: 'Logo' },
  { type: 'companyInfo', label: 'Company Info' },
  { type: 'clientInfo', label: 'Client Info' },
  { type: 'lineItems', label: 'Line Items' },
  { type: 'totals', label: 'Totals' },
  { type: 'notes', label: 'Notes' },
  { type: 'customText', label: 'Custom Text' },
];

const ItemTypes = {
  PALETTE: 'palette',
  CANVAS: 'canvas',
};

function DraggablePaletteItem({ item }: { item: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PALETTE,
    item: { type: item.type },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));
  return (
    <div ref={(node) => { drag(node); }}>
      <Card className={`p-3 cursor-move hover:bg-orange-50 ${isDragging ? 'opacity-50' : ''}`}>{item.label}</Card>
    </div>
  );
}

function DraggableCanvasItem({ item, index, moveItem, onRemove, onEdit, isEditing }: { item: any; index: number; moveItem: (from: number, to: number) => void; onRemove: (id: number) => void; onEdit: (id: number) => void; isEditing: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CANVAS,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [index]);
  const [, drop] = useDrop({
    accept: ItemTypes.CANVAS,
    hover: (dragged: any) => {
      if (dragged.index !== index) {
        moveItem(dragged.index, index);
        dragged.index = index;
      }
    },
  });
  drag(drop(ref));
  return (
    <Card ref={ref} className={`p-3 flex items-center justify-between ${isDragging ? 'opacity-50' : ''} ${isEditing ? 'ring-2 ring-orange-400' : ''}`}> 
      <span className="cursor-move mr-2" title="Drag to reorder">☰</span>
      <span className="flex-1 cursor-pointer" onClick={() => onEdit(item.id)}>{PALETTE.find(p => p.type === item.type)?.label || item.type}</span>
      <Button size="sm" variant="destructive" onClick={() => onRemove(item.id)}>Remove</Button>
    </Card>
  );
}

function EditSidebar({ item, onChange, onClose }: { item: any; onChange: (newItem: any) => void; onClose: () => void }) {
  // For logo upload
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ ...item, logoUrl: ev.target?.result });
    };
    reader.readAsDataURL(file);
  }
  // For custom text
  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...item, text: e.target.value });
  }
  function handleFontSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...item, fontSize: e.target.value });
  }
  // For background color
  function handleBgColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...item, bgColor: e.target.value });
  }
  return (
    <aside className="w-80 bg-white border-l p-6 flex flex-col fixed right-0 top-0 h-full z-30 shadow-xl">
      <h2 className="text-lg font-bold mb-4">Edit Component</h2>
      <div className="space-y-4 flex-1">
        {item.type === 'logo' && (
          <div>
            <label className="block text-xs font-semibold mb-1">Logo Image</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
            {item.logoUrl && <img src={item.logoUrl} alt="Logo" className="mt-2 max-h-24" />}
          </div>
        )}
        {item.type === 'customText' && (
          <>
            <div>
              <label className="block text-xs font-semibold mb-1">Text</label>
              <input type="text" value={item.text || ''} onChange={handleTextChange} className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Font Size</label>
              <input type="number" value={item.fontSize || 16} min={8} max={64} onChange={handleFontSizeChange} className="border rounded px-2 py-1 w-24" />
            </div>
          </>
        )}
        {/* All components: background color */}
        <div>
          <label className="block text-xs font-semibold mb-1">Background Color</label>
          <input type="color" value={item.bgColor || '#ffffff'} onChange={handleBgColorChange} className="w-12 h-8 p-0 border-none" />
        </div>
      </div>
      <Button className="mt-6" onClick={onClose}>Done</Button>
    </aside>
  );
}

export default function InvoiceTemplateDesignerPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [canvas, setCanvas] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/invoice-templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setCanvas(JSON.parse(data[0].templateJson || '[]'));
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load templates'); setLoading(false); });
  }, []);

  const selectedTemplate = templates.find(t => t.id === selectedId);
  const editingItem = canvas.find((item: any) => item.id === editingId);

  function handleAddTemplate() {
    const name = prompt('Template name?');
    if (!name) return;
    setLoading(true);
    fetch('/api/invoice-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, templateJson: JSON.stringify([]) }),
    })
      .then(res => res.json())
      .then(newTemplate => {
        setTemplates(t => [...t, newTemplate]);
        setSelectedId(newTemplate.id);
        setCanvas([]);
        setLoading(false);
      })
      .catch(() => { setError('Failed to add template'); setLoading(false); });
  }

  function handleDeleteTemplate(id: number) {
    if (!window.confirm('Delete this template?')) return;
    setLoading(true);
    fetch('/api/invoice-templates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(() => {
        setTemplates(t => t.filter(temp => temp.id !== id));
        if (selectedId === id && templates.length > 1) {
          const next = templates.find(temp => temp.id !== id);
          setSelectedId(next?.id || null);
          setCanvas(next ? JSON.parse(next.templateJson || '[]') : []);
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to delete template'); setLoading(false); });
  }

  function handleSelectTemplate(id: number) {
    setSelectedId(id);
    const t = templates.find(temp => temp.id === id);
    setCanvas(t?.templateJson ? JSON.parse(t.templateJson) : []);
  }

  function handleAddToCanvas(type: string) {
    setCanvas(c => [...c, { type, id: Date.now() }]);
  }

  function handleRemoveFromCanvas(id: number) {
    setCanvas(c => c.filter(item => item.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function moveCanvasItem(from: number, to: number) {
    setCanvas(c => {
      const updated = [...c];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }

  function handleSave() {
    if (!selectedId) return;
    setLoading(true);
    fetch('/api/invoice-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedId, name: selectedTemplate?.name, templateJson: JSON.stringify(canvas) }),
    })
      .then(res => res.json())
      .then(updated => {
        setTemplates(ts => ts.map(t => t.id === selectedId ? { ...t, templateJson: JSON.stringify(canvas) } : t));
        setLoading(false);
        alert('Template saved!');
      })
      .catch(() => { setError('Failed to save template'); setLoading(false); });
  }

  function handleEditItem(id: number) {
    setEditingId(id);
  }

  function handleChangeItem(newItem: any) {
    setCanvas(c => c.map(item => item.id === newItem.id ? newItem : item));
  }

  function handleCloseEdit() {
    setEditingId(null);
  }

  // Drop target for palette items
  const [, drop] = useDrop({
    accept: ItemTypes.PALETTE,
    drop: (item: any) => handleAddToCanvas(item.type),
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Templates</h2>
          {loading && <div className="text-xs text-gray-400 mb-2">Loading...</div>}
          {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
          <ul className="flex-1 space-y-2">
            {templates.map(t => (
              <li key={t.id}>
                <Button
                  variant={t.id === selectedId ? 'default' : 'ghost'}
                  className="w-full justify-between"
                  onClick={() => handleSelectTemplate(t.id)}
                  disabled={loading}
                >
                  {t.name}
                  <span onClick={e => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="ml-2 text-red-500 cursor-pointer">&times;</span>
                </Button>
              </li>
            ))}
          </ul>
          <Button className="mt-4" onClick={handleAddTemplate} disabled={loading}>+ Add Template</Button>
        </aside>
        {/* Main Designer Area */}
        <main className="flex-1 flex flex-col p-8">
          <h1 className="text-2xl font-bold mb-6">Invoice Template Designer</h1>
          <div className="flex gap-8 flex-1">
            {/* Palette */}
            <section className="w-56">
              <h3 className="font-semibold mb-2">Palette</h3>
              <div className="space-y-2">
                {PALETTE.map(item => (
                  <DraggablePaletteItem key={item.type} item={item} />
                ))}
              </div>
            </section>
            {/* Canvas */}
            <section className="flex-1 relative">
              <h3 className="font-semibold mb-2">Layout Canvas <span className="text-xs text-gray-400">(Drag-and-drop enabled)</span></h3>
              <div ref={node => { drop(node); }} className="min-h-[400px] bg-white border rounded-xl p-6 flex flex-col gap-3">
                {canvas.length === 0 && <div className="text-gray-400">Drag components here</div>}
                {canvas.map((item, idx) => (
                  <DraggableCanvasItem key={item.id} item={item} index={idx} moveItem={moveCanvasItem} onRemove={handleRemoveFromCanvas} onEdit={handleEditItem} isEditing={editingId === item.id} />
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSave} disabled={loading}>Save</Button>
                <Button variant="outline" onClick={() => setPreviewMode(m => !m)}>{previewMode ? 'Back to Edit' : 'Preview'}</Button>
              </div>
              {editingItem && <EditSidebar item={editingItem} onChange={handleChangeItem} onClose={handleCloseEdit} />}
            </section>
            {/* Live Preview */}
            {previewMode && (
              <section className="w-96">
                <h3 className="font-semibold mb-2">Live Preview</h3>
                <div className="bg-white border rounded-xl p-6 min-h-[400px]">
                  {canvas.map(item => (
                    <div key={item.id} className="mb-3 p-2 border-b last:border-b-0" style={{ background: item.bgColor || '#fff' }}>
                      {item.type === 'logo' && item.logoUrl && <img src={item.logoUrl} alt="Logo" className="max-h-16 mb-2" />}
                      {item.type === 'customText' && <div style={{ fontSize: item.fontSize || 16 }}>{item.text || '[Custom Text]'}</div>}
                      <b>{PALETTE.find(p => p.type === item.type)?.label || item.type}</b>
                      <div className="text-xs text-gray-500">[Preview of {item.type}]</div>
                    </div>
                  ))}
                  {canvas.length === 0 && <div className="text-gray-400">Nothing to preview</div>}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </DndProvider>
  );
} 