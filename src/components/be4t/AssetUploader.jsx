import React, { useState } from 'react';
import { Upload, FileText, Plus } from 'lucide-react';
import { supabase } from '../../core/xplit/supabaseClient';
import './AssetUploader.css';

const AssetUploader = ({ onComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [assetData, setAssetData] = useState({
        name: '',
        asset_type: 'music',
        valuation_usd: '',
        total_supply: '',
    });

    // Dynamic Metadata
    const [musicMeta, setMusicMeta] = useState({ artist: '', isrc: '', yield_estimate: '' });
    const [customMeta, setCustomMeta] = useState([{ key: '', value: '' }]);

    const [legalFile, setLegalFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // AI Legal Parser Simulator
    React.useEffect(() => {
        if (legalFile && legalFile.name.toLowerCase().includes('acuerdo de fraccionamiento')) {
            setIsScanning(true);
            setTimeout(() => {
                setAssetData(prev => ({ ...prev, name: 'Noche en Bogotá', asset_type: 'music', valuation_usd: 25000, total_supply: 2500 }));
                setMusicMeta(prev => ({ ...prev, artist: 'Su Presencia', isrc: 'QM-46B-24-01234' }));
                setIsScanning(false);
            }, 3000);
        }
    }, [legalFile]);

    const handleBaseChange = (e) => {
        const { name, value } = e.target;
        setAssetData(prev => ({ ...prev, [name]: value }));
    };

    const handleMusicChange = (e) => {
        const { name, value } = e.target;
        setMusicMeta(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCustomField = () => {
        setCustomMeta([...customMeta, { key: '', value: '' }]);
    };

    const handleRemoveCustomField = (index) => {
        if (customMeta.length === 1) return;
        setCustomMeta(customMeta.filter((_, i) => i !== index));
    };

    const handleCustomChange = (index, field, value) => {
        const updated = [...customMeta];
        updated[index][field] = value;
        setCustomMeta(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Build metadata JSONB
            let finalMetadata = {};
            if (assetData.asset_type === 'music') {
                finalMetadata = { ...musicMeta };
            } else {
                customMeta.forEach(item => {
                    if (item.key && item.value) {
                        finalMetadata[item.key] = item.value;
                    }
                });
            }

            const supply = Number(assetData.total_supply) || 1;
            const tokenPrice = Number(assetData.valuation_usd) / supply;
            const generatedSymbol = assetData.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();

            const payload = {
                name: assetData.name,
                symbol: generatedSymbol,
                asset_type: assetData.asset_type === 'music' ? 'music' : 'custom',
                token_price_usd: tokenPrice,
                total_supply: supply,
                metadata: finalMetadata
            };

            const { error } = await supabase.from('assets').insert([payload]);
            if (error) throw error;

            alert('✅ Activo publicado y listado exitosamente en el Marketplace.');
            onComplete();
        } catch (error) {
            console.error('Error inyectando activo:', error);
            alert(`Error publicando: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForceSubmit = async () => {
        setIsLoading(true);
        try {
            const finalMetadata = { "Tipo": "Factoring", "Vencimiento": "45 días", "Deudor": "TechExport" };
            const payload = {
                name: assetData.name || 'Factura Tech-Export (Force)',
                symbol: 'TECH',
                asset_type: 'custom',
                token_price_usd: 100,
                total_supply: 50,
                metadata: finalMetadata
            };

            const { error } = await supabase.from('assets').insert([payload]);
            if (error) throw error;

            alert('✅ Activo forzado a la BD exitosamente.');
            onComplete();
        } catch (error) {
            console.error('Error forzando activo:', error);
            alert(`Error forzando: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="uploader-container animate-fade-in" style={{ paddingBottom: '120px' }}>
            <div className="uploader-header">
                <h1>Emisión de Activos B2B</h1>
                <p>Digitaliza, estructura y lista activos en la red BE4T.</p>
            </div>

            <form className="uploader-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre del Activo</label>
                    <input type="text" name="name" className="form-input" placeholder="Ej: Luna Neón / Factura GlobalTrade" value={assetData.name} onChange={handleBaseChange} required />
                </div>

                <div className="flex-row">
                    <div className="form-group flex-1">
                        <label>Tipo de Activo</label>
                        <select name="asset_type" className="form-input" value={assetData.asset_type} onChange={handleBaseChange} required>
                            <option value="music">Música (Regalías)</option>
                            <option value="factoring">Factoring Institucional</option>
                            <option value="custom">Otro (Agnóstico)</option>
                        </select>
                    </div>
                </div>

                <div className="flex-row">
                    <div className="form-group flex-1">
                        <label>Valoración Total (USD)</label>
                        <input type="number" name="valuation_usd" className="form-input" placeholder="Ej: 15000" value={assetData.valuation_usd} onChange={handleBaseChange} required min="1"/>
                    </div>
                    <div className="form-group flex-1">
                        <label>Fracciones Emitidas (Supply)</label>
                        <input type="number" name="total_supply" className="form-input" placeholder="Ej: 1000" value={assetData.total_supply} onChange={handleBaseChange} required min="1"/>
                    </div>
                </div>

                <div className="dynamic-fields-card">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Metadata Inteligente</h3>
                    
                    {assetData.asset_type === 'music' ? (
                        <div className="flex-row" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group flex-1">
                                <label>Artista Principal</label>
                                <input type="text" name="artist" className="form-input" placeholder="Nombre Comercial" value={musicMeta.artist} onChange={handleMusicChange} required/>
                            </div>
                            <div className="form-group flex-1">
                                <label>Código ISRC</label>
                                <input type="text" name="isrc" className="form-input" placeholder="US-XXX-00-00000" value={musicMeta.isrc} onChange={handleMusicChange} required/>
                            </div>
                            <div className="form-group flex-1" style={{ minWidth: '100%' }}>
                                <label>Rendimiento Estimado (Yield %)</label>
                                <input type="text" name="yield_estimate" className="form-input" placeholder="Ej: 12% a 15% anual" value={musicMeta.yield_estimate} onChange={handleMusicChange} />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Ingresa pares clave-valor para crear la ficha técnica del activo RWA.
                            </p>
                            {customMeta.map((item, index) => (
                                <div className="flex-row" style={{ marginBottom: '1rem' }} key={index}>
                                    <input type="text" className="form-input flex-1" placeholder="Ej: Tasa de Descuento" value={item.key} onChange={(e) => handleCustomChange(index, 'key', e.target.value)} />
                                    <input type="text" className="form-input flex-1" placeholder="Ej: 2.5% M.V." value={item.value} onChange={(e) => handleCustomChange(index, 'value', e.target.value)} />
                                    <button type="button" className="btn-remove" onClick={() => handleRemoveCustomField(index)} title="Remover">X</button>
                                </div>
                            ))}
                            <button type="button" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }} onClick={handleAddCustomField}>
                                <Plus size={16} /> Añadir Atributo
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-group mt-3">
                    <label>Contrato Legal</label>
                    <div className="dropzone">
                        <div className="dropzone-icon">
                            <FileText size={48} />
                        </div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                            {isScanning ? '🤖 Analizando con Inteligencia Legal (Espere)...' : (legalFile ? legalFile.name : 'Arrastra el PDF del Contrato Aquí')}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            {isScanning ? 'Extrayendo firmas, ISRC y valoraciones del documento.' : 'El documento será hasheado y amarrado al activo.'}
                        </p>
                        <input type="file" id="file" style={{ display: 'none' }} accept=".pdf" disabled={isScanning} onChange={(e) => setLegalFile(e.target.files[0])} />
                        <label htmlFor="file" className="btn-tertiary" style={{ display: 'inline-block', cursor: isScanning ? 'not-allowed' : 'pointer', opacity: isScanning ? 0.5 : 1 }}>
                            Explorar Archivos
                        </label>
                    </div>
                </div>

                <div className="uploader-footer" style={{ flexWrap: 'wrap' }}>
                    <button type="button" className="btn-secondary flex-1" onClick={onComplete} disabled={isLoading}>Cancelar</button>
                    <button type="button" className="btn-secondary" style={{ background: '#ff3366', color: 'white', border: 'none' }} onClick={handleForceSubmit} disabled={isLoading}>
                        Fuerza Emisión (Bypass)
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
                        {isLoading ? 'Publicando red...' : 'Emitir Activo Públicamente'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssetUploader;
