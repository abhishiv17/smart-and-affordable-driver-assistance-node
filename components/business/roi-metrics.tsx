import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ShieldCheck, Banknote } from 'lucide-react';

const metrics = [
  {
    title: 'Accident Reduction',
    value: '40% - 60%',
    description: 'Proactive fatigue alerting prevents the most common cause of highway trucking accidents.',
    icon: ShieldCheck,
    color: 'text-emerald-500',
  },
  {
    title: 'Insurance Premium Savings',
    value: 'Up to 15%',
    description: 'Verifiable AI safety reports provide leverage to negotiate lower commercial fleet insurance rates.',
    icon: Banknote,
    color: 'text-blue-500',
  },
  {
    title: 'Operational ROI Time',
    value: '< 4 Months',
    description: 'The cost of one SADAN node is recovered by preventing a single minor collision or delayed delivery.',
    icon: TrendingUp,
    color: 'text-violet-500',
  },
];

export function RoiMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
            <metric.icon className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className={`w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-6`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-2">{metric.value}</h3>
            <p className="font-semibold text-foreground mb-2">{metric.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
