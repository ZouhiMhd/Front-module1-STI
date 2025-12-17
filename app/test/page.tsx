import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8 transition-colors">
      <div className="mx-auto max-w-4xl">
        {/* Header with Theme Toggle */}
        <header className="mb-12 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Color Palette</h1>
          <ThemeToggle />
        </header>

        {/* Primary Blue Shades */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Primary Blue Scale
          </h2>
          <div className="grid grid-cols-11 gap-2">
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-50 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">50</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-100 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">100</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-200 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">200</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-300 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">300</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-400 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">400</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-500 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">500</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-600 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">600</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-700 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">700</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-800 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">800</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-900 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">900</span>
            </div>
            <div className="text-center">
              <div className="h-16 w-full rounded-lg bg-primary-950 shadow-sm" />
              <span className="mt-2 block text-xs text-text-secondary">950</span>
            </div>
          </div>
        </section>

        {/* Background Colors */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Background Colors
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <div className="h-20 rounded-lg bg-background-light shadow-inner" />
              <p className="mt-2 text-sm text-text-secondary">Light</p>
              <code className="text-xs text-text-secondary">#F6F7F8</code>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="h-20 rounded-lg bg-background-white shadow-inner" />
              <p className="mt-2 text-sm text-text-secondary">White/Surface</p>
              <code className="text-xs text-text-secondary">
                #FFFFFF / #1A2632
              </code>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="h-20 rounded-lg bg-background-dark shadow-inner" />
              <p className="mt-2 text-sm text-text-secondary">Dark</p>
              <code className="text-xs text-text-secondary">#101A22</code>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="h-20 rounded-lg bg-surface-dark shadow-inner" />
              <p className="mt-2 text-sm text-text-secondary">Surface Dark</p>
              <code className="text-xs text-text-secondary">#1A2632</code>
            </div>
          </div>
        </section>

        {/* Text Colors */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Text Colors
          </h2>
          <div className="space-y-4 rounded-lg border border-border bg-background-white p-6">
            <p className="text-xl text-foreground">
              Foreground text (adapts to theme)
            </p>
            <p className="text-xl text-text-primary">
              Primary text (#111518)
            </p>
            <p className="text-xl text-text-secondary">
              Secondary text (adapts to theme)
            </p>
            <div className="rounded-lg bg-background-dark p-4">
              <p className="text-xl text-text-light">
                Light text for dark backgrounds (#E5E7EB)
              </p>
            </div>
          </div>
        </section>

        {/* Functional Colors */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Functional Colors
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Success */}
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="bg-success p-4">
                <span className="font-medium text-white">Success</span>
              </div>
              <div className="bg-success-light p-3">
                <span className="text-sm text-success-dark">Light variant</span>
              </div>
              <div className="bg-background-white p-2 text-center">
                <code className="text-xs text-text-secondary">#22C55E</code>
              </div>
            </div>

            {/* Error */}
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="bg-error p-4">
                <span className="font-medium text-white">Error</span>
              </div>
              <div className="bg-error-light p-3">
                <span className="text-sm text-error-dark">Light variant</span>
              </div>
              <div className="bg-background-white p-2 text-center">
                <code className="text-xs text-text-secondary">#EF4444</code>
              </div>
            </div>

            {/* Warning */}
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="bg-warning p-4">
                <span className="font-medium text-white">Warning</span>
              </div>
              <div className="bg-warning-light p-3">
                <span className="text-sm text-warning-dark">Light variant</span>
              </div>
              <div className="bg-background-white p-2 text-center">
                <code className="text-xs text-text-secondary">#F59E0B</code>
              </div>
            </div>

            {/* Info */}
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="bg-info p-4">
                <span className="font-medium text-white">Info</span>
              </div>
              <div className="bg-info-light p-3">
                <span className="text-sm text-info-dark">Light variant</span>
              </div>
              <div className="bg-background-white p-2 text-center">
                <code className="text-xs text-text-secondary">#38BDF8</code>
              </div>
            </div>
          </div>
        </section>

        {/* Example UI Components */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Example Components
          </h2>
          <div className="space-y-6 rounded-lg border border-border bg-background-white p-6">
            {/* Buttons */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-secondary">
                Buttons
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600">
                  Primary Button
                </button>
                <button className="rounded-lg bg-primary-100 px-4 py-2 font-medium text-primary-700 transition-colors hover:bg-primary-200">
                  Secondary Button
                </button>
                <button className="rounded-lg border border-border bg-background-white px-4 py-2 font-medium text-foreground transition-colors hover:bg-background-light">
                  Outline Button
                </button>
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-secondary">
                Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-success-light p-4">
                  <span className="text-success">&#10003;</span>
                  <span className="text-success-dark">
                    Operation completed successfully!
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-error-light p-4">
                  <span className="text-error">&#10005;</span>
                  <span className="text-error-dark">
                    An error occurred. Please try again.
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-warning-light p-4">
                  <span className="text-warning">&#9888;</span>
                  <span className="text-warning-dark">
                    Warning: This action cannot be undone.
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-info-light p-4">
                  <span className="text-info">&#8505;</span>
                  <span className="text-info-dark">
                    Information: New updates are available.
                  </span>
                </div>
              </div>
            </div>

            {/* Card */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-secondary">
                Card
              </h3>
              <div className="max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-foreground">
                  Card Title
                </h4>
                <p className="mt-2 text-text-secondary">
                  This is a sample card component demonstrating the color
                  palette in action.
                </p>
                <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
