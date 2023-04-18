export const DonationFormTemplate: any = {
  name: 'DonationForm',
  label: 'Spendenformular',
  fields: [
    {
      type: 'string',
      name: 'id',
      ui: {
        component: () => (
          <p>Das Spendenformular besitzt keine Einstellungsmöglichkeiten</p>
        ),
      },
    },
  ],
}
