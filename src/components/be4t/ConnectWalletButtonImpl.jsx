/**
 * ConnectWalletButtonImpl — real Thirdweb ConnectButton
 * Imported lazily — only bundled when isProduction=true
 */
import React from 'react';
import { createThirdwebClient } from 'thirdweb';
import { ThirdwebProvider, ConnectButton } from 'thirdweb/react';
import { baseSepolia } from 'thirdweb/chains';
import { THIRDWEB_CLIENT_ID } from '../../core/env';

const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });

const ConnectWalletButtonImpl = () => (
    <ThirdwebProvider>
        <ConnectButton
            client={client}
            chain={baseSepolia}
            connectButton={{
                label: 'Conectar Wallet',
                style: {
                    padding: '0.4rem 1rem',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))',
                    border: '1px solid rgba(16,185,129,0.4)',
                    borderRadius: '100px',
                    color: '#10b981',
                    fontSize: '0.72rem', fontWeight: '700',
                    fontFamily: "'Inter', sans-serif",
                },
            }}
            detailsButton={{
                style: {
                    padding: '0.4rem 1rem',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '100px',
                    color: '#10b981',
                    fontSize: '0.72rem', fontWeight: '700',
                },
            }}
        />
    </ThirdwebProvider>
);

export default ConnectWalletButtonImpl;
