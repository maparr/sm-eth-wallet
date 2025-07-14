import { FC } from 'react';
import { WalletInterface } from './containers/WalletInterface';
import { Github } from 'lucide-react';

const App: FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">

        {/* Main Content */}
        <main>
          <WalletInterface />
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-border">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center text-muted-foreground">
              <Github className="w-5 h-5 mr-2" />
              Open Source EVM Wallet
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Minimal Dependencies EVM Wallet
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;