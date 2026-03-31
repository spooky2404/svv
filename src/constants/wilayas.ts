export interface Wilaya {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// 1st Military Region (1RM) Wilayas
export const WILAYAS: Wilaya[] = [
  { id: '2', name: 'Chlef', lat: 36.1653, lng: 1.3345 },
  { id: '9', name: 'Blida', lat: 36.4700, lng: 2.8277 },
  { id: '10', name: 'Bouira', lat: 36.3749, lng: 3.9020 },
  { id: '15', name: 'Tizi Ouzou', lat: 36.7118, lng: 4.0459 },
  { id: '16', name: 'Alger', lat: 36.7538, lng: 3.0588 },
  { id: '17', name: 'Djelfa', lat: 34.6667, lng: 3.2500 },
  { id: '26', name: 'Médéa', lat: 36.2642, lng: 2.7539 },
  { id: '28', name: 'M\'Sila', lat: 35.7058, lng: 4.5419 },
  { id: '35', name: 'Boumerdès', lat: 36.7667, lng: 3.4667 },
  { id: '42', name: 'Tipaza', lat: 36.5897, lng: 2.4475 },
  { id: '44', name: 'Aïn Defla', lat: 36.2667, lng: 1.9667 }
];
