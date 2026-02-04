import React from 'react';
import { X } from 'lucide-react';

const STICKER_PACKS = [
    {
        name: 'Classic',
        stickers: [
            '🙂', '😂', '😍', '😎', '🥳', '🤔', '😴', '🥺', '😡', '🤯',
            '👍', '👎', '❤️', '🔥', '✨', '🎉', '💩', '👻', '👽', '🤖'
        ]
    },
    {
        name: 'Animals',
        stickers: [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅'
        ]
    },
    {
        name: 'Food',
        stickers: [
            '🍎', '🍌', '🍐', '🍊', '🍋', '🍇', '🍓', '🍉', '🍒', '🍑',
            '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🍝', '🍣'
        ]
    }
];

export default function StickerPicker({ onSelect, onClose }) {
    return (
        <div style={{
            position: 'absolute',
            bottom: '70px',
            right: '20px',
            width: '320px',
            height: '400px',
            background: '#1a2332',
            border: '1px solid #2a3441',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #2a3441',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#151f2e'
            }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>Stickers & Emoji</h3>
                <X
                    size={20}
                    style={{ cursor: 'pointer', color: '#8b98a5' }}
                    onClick={onClose}
                />
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px'
            }}>
                {STICKER_PACKS.map(pack => (
                    <div key={pack.name} style={{ marginBottom: '20px' }}>
                        <h4 style={{
                            fontSize: '12px',
                            color: '#8b98a5',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '10px'
                        }}>
                            {pack.name}
                        </h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '8px'
                        }}>
                            {pack.stickers.map(sticker => (
                                <div
                                    key={sticker}
                                    onClick={() => onSelect(sticker)}
                                    style={{
                                        fontSize: '32px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#2a3441';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {sticker}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
