import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDictionary } from '@/lib/dictionaries'

export default async function GenericPage({ params }: { params: any }) {
  const { lang } = await params;
  const dict = await getDictionary(lang)
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Module Coming Soon</h2>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>Work in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This module is scheduled for the next development phase.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
