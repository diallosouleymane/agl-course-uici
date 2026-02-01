import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Accès Refusé</CardTitle>
          </div>
          <CardDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Cette section est réservée aux administrateurs ou aux responsables de département.
            Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur système.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="default">
              <Link href="/dashboard">Retour au tableau de bord</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Se déconnecter</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
