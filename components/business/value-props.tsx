import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Truck, Zap, WifiOff } from 'lucide-react';

const valueProps = [
  {
    title: 'Plug & Deploy Architecture',
    description: 'Self-contained node that mounts on the dashboard. No deep ECU integration or voiding OEM warranties required.',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    title: 'Universal Retrofit Compatibility',
    description: 'Designed specifically for the unorganized sector. Works on a 15-year-old Tata truck just as well as a brand new Volvo.',
    icon: Truck,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    title: 'Edge-AI Offline Processing',
    description: 'Processes drowsiness and G-force locally on the device. Critical alerts sound instantly even on zero-connectivity highways.',
    icon: Cpu,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

export function ValueProps() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {valueProps.map((prop, idx) => (
        <Card key={idx} className={`border ${prop.border} shadow-sm transition-all hover:shadow-md`}>
          <CardHeader className="pb-2">
            <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg ${prop.bg}`}>
              <prop.icon className={`h-5 w-5 ${prop.color}`} />
            </div>
            <CardTitle className="text-lg font-semibold">{prop.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {prop.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
