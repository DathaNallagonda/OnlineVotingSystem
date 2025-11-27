import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Vote, Shield, CheckCircle, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SecureVote</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/results">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Results
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-foreground">
              Your Voice,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Vote
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure, transparent, and accessible online voting platform. 
              Participate in democracy from anywhere, anytime.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Link to="/auth/register">
              <Button variant="hero" size="lg" className="gap-2">
                <Vote className="h-5 w-5" />
                Start Voting
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="outline" size="lg" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                View Results
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="lg" className="gap-2">
                <Shield className="h-5 w-5" />
                Admin Access
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="bg-card p-6 rounded-lg border border-border shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Secure Authentication</h3>
              <p className="text-muted-foreground">
                Gmail-based OTP verification ensures only authorized voters can participate
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Vote className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">One Vote Per Election</h3>
              <p className="text-muted-foreground">
                Our system prevents duplicate voting, ensuring fair and accurate results
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Instant Confirmation</h3>
              <p className="text-muted-foreground">
                Receive immediate confirmation via email when your vote is successfully recorded
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 SecureVote. Building trust in digital democracy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
