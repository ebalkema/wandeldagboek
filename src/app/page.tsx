import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="bg-green-50 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Welkom bij het Wandeldagboek</h1>
        <p className="text-gray-700 mb-4">
          Leg je natuurwaarnemingen vast tijdens het wandelen. Spreek in wat je ziet,
          voeg foto&apos;s toe en bouw je eigen natuurdagboek op.
        </p>
        <div className="flex space-x-4 mt-6">
          <Link 
            href="/natuurfeitjes" 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Natuurfeitjes
          </Link>
          <Link
            href="/waarneming"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nieuwe waarneming
          </Link>
          <Link 
            href="/dashboard" 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Mijn waarnemingen
          </Link>
          <Link 
            href="/podcast" 
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Podcast
          </Link>
        </div>
      </section>
      
      <section className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Wandeldagboek App Functies</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold">Natuurfeitjes</h3>
            <p>Ontdek interessante natuurfeitjes en de vogel van de maand.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold">Waarnemingen vastleggen</h3>
            <p>Spreek in wat je ziet en voeg foto&apos;s toe aan je waarnemingen.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold">Persoonlijk dagboek</h3>
            <p>Bekijk al je waarnemingen in je persoonlijke natuurdagboek.</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-bold">Menno & Erwin Podcast</h3>
            <p>Luister naar de nieuwste aflevering van de Menno & Erwin podcast.</p>
          </div>
        </div>
      </section>
    </div>
  );
} 