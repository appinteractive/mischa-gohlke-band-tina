export const TeamTemplate: any = {
  name: 'Team',
  label: 'Team Übersicht',
  fields: [
    {
      type: 'string',
      name: 'id',
      ui: {
        component: () => (
          <p>Momentan kein Einstellungsmöglichkeiten vorhanden</p>
        ),
      },
    },
  ],
}
