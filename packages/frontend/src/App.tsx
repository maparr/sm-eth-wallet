import { FC } from 'react';
import { WalletInterface } from './containers/WalletInterface';
import { Shield, Github } from 'lucide-react';

const App: FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              Minimal EVM Wallet
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure EIP-155 transaction signing with BIP44 HD wallet derivation.
            Built with minimal dependencies and audited cryptographic libraries.
          </p>
        </header>

        {/* Main Content */}
        <main>
          <WalletInterface />
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-border">
          <div className="flex items-center justify-center mb-4">
            <a
              href="https://github.com/gridplus/minimal-evm-wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-indigo-600 transition-colors"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            GridPlus Take-Home Assignment - Minimal Dependencies EVM Wallet
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;