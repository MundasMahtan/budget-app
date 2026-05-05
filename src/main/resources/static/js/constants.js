'use strict';

const STRINGS = {
  tabs: {
    transactions: 'Συναλλαγές',
    dashboard:    'Πίνακας',
    budget:       'Προϋπολογισμός',
  },

  transactions: {
    title:                'Συναλλαγές',
    quickAddLabel:        'Γρήγορη καταχώρηση',
    amountPlaceholder:    '0,00',
    descriptionPlaceholder: 'Περιγραφή',
    subcategoryPlaceholder: 'Επιλέξτε υποκατηγορία…',
    submitButton:         'Καταχώρηση',
    emptyState:           'Καμία συναλλαγή αυτόν τον μήνα',
  },

  dashboard: {
    title:      'Πίνακας',
    income:     'Έσοδα',
    expenses:   'Έξοδα',
    balance:    'Υπόλοιπο',
    categories: 'Κατηγορίες',
  },

  budget: {
    title:                  'Προϋπολογισμός',
    monthTotal:             'Σύνολο μήνα',
    fillBlanks:             'Συμπλήρωση κενών',
    fillBlanksConfirmTitle: 'Συμπλήρωση από προηγούμενο μήνα;',
    fillBlanksConfirmBody:  'Δεν θα αντικατασταθούν τιμές που έχετε ήδη εισάγει.',
    cancel:                 'Άκυρο',
    confirm:                'Συμπλήρωση',
  },

  editTransaction: {
    title:       'Επεξεργασία',
    cancel:      'Άκυρο',
    save:        'Αποθήκευση',
    amount:      'Ποσό',
    description: 'Περιγραφή',
    subcategory: 'Υποκατηγορία',
    date:        'Ημερομηνία',
    createdAt:   'Καταχωρήθηκε:',
    deleteButton: 'Διαγραφή',
  },

  deleteConfirm: {
    title:   'Διαγραφή συναλλαγής;',
    body:    'Η συναλλαγή θα αφαιρεθεί από τις εμφανίσεις και τα σύνολα.',
    cancel:  'Άκυρο',
    confirm: 'Διαγραφή',
  },

  drillIn: {
    back:          '‹ Πίσω',
    monthTotal:    'Σύνολο μήνα',
    budget:        'Προϋπολογισμός',
    subcategories: 'Υποκατηγορίες',
    transactions:  'Συναλλαγές μήνα',
    overBudget:    'Υπέρβαση κατά',
    noBudget:      '—',
  },

  errors: {
    generic:    'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',
    saved:      'Αποθηκεύτηκε',
    saveFailed: 'Αποτυχία αποθήκευσης',
  },
};
