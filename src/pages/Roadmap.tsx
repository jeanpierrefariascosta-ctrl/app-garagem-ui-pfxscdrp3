import { Map, CircleDashed, Rocket, Settings } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { Card } from '@/components/ui/card'

export default function Roadmap() {
  const features = [
    {
      title: 'Real-time Push Notifications',
      desc: 'Transition from mock toasts to real FCM/OneSignal mobile notifications for external alerts.',
      status: 'Pending',
      icon: Rocket,
    },
    {
      title: 'Internal Chat (V2)',
      desc: 'Direct messaging system between Workshops and Drivers for negotiation and updates.',
      status: 'Pending',
      icon: Settings,
    },
    {
      title: 'Maintenance Analytics',
      desc: 'Financial reports and savings dashboard showing Preventive vs. Corrective maintenance costs.',
      status: 'Pending',
      icon: Settings,
    },
    {
      title: 'External Alerts Integration',
      desc: 'Automated Email and SMS notification triggers for critical maintenance dates.',
      status: 'Pending',
      icon: Rocket,
    },
    {
      title: 'Advanced Kanban Board',
      desc: 'Drag-and-drop interaction functionality for moving quotes between status columns seamlessly.',
      status: 'Pending',
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-col min-h-full animate-fade-in pb-20 md:pb-8">
      <Header />
      <div className="p-5 md:p-8 space-y-6 mt-2">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-primary tracking-tight">Product Roadmap</h2>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          A structured summary of pending suggestions and future improvements to guide the next
          phases of development for the Garagem app.
        </p>

        <div className="grid md:grid-cols-2 gap-4 pt-4">
          {features.map((f, i) => (
            <Card
              key={i}
              className="p-6 shadow-soft border-none rounded-2xl hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{f.title}</h3>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold bg-muted/80 px-3 py-1.5 rounded-full text-muted-foreground whitespace-nowrap">
                  <CircleDashed className="w-3.5 h-3.5" /> {f.status}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-[3.25rem]">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
