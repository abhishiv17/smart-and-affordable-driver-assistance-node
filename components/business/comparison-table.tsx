import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  { name: 'Live Location Tracking', legacy: true, sadan: true },
  { name: 'Cost per Node', legacy: '₹2,000 - ₹5,000', sadan: '₹4,500 - ₹6,000' },
  { name: 'Accident Prevention', legacy: false, sadan: true },
  { name: 'Driver Fatigue Detection', legacy: false, sadan: true },
  { name: 'Harsh Braking/Acceleration', legacy: false, sadan: true },
  { name: 'Offline Alerting (Zero Network)', legacy: false, sadan: true },
  { name: 'AI Incident Analysis', legacy: false, sadan: true },
  { name: 'Approach', legacy: 'Reactive (Post-Incident)', sadan: 'Proactive (Pre-Incident)' },
];

export function ComparisonTable() {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Capability</th>
                <th className="px-6 py-4 text-center border-x border-border/50 bg-background">Traditional GPS</th>
                <th className="px-6 py-4 text-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500">SADAN Edge-AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {features.map((feature, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{feature.name}</td>
                  
                  {/* Legacy Column */}
                  <td className="px-6 py-4 text-center border-x border-border/50 bg-background/50">
                    {typeof feature.legacy === 'boolean' ? (
                      feature.legacy ? (
                        <CheckCircle2 className="w-5 h-5 text-muted-foreground mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      )
                    ) : (
                      <span className="text-muted-foreground">{feature.legacy}</span>
                    )}
                  </td>
                  
                  {/* SADAN Column */}
                  <td className="px-6 py-4 text-center bg-emerald-500/5">
                    {typeof feature.sadan === 'boolean' ? (
                      feature.sadan ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto drop-shadow-sm" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{feature.sadan}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
