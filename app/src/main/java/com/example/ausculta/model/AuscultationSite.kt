package com.example.ausculta.model

enum class AuscultationSite(val displayName: String, val category: String, val description: String) {
    AORTIC("Aortic Area", "Heart", "2nd intercostal space right sternal border"),
    PULMONIC("Pulmonic Area", "Heart", "2nd intercostal space left sternal border"),
    TRICUSPID("Tricuspid Area", "Heart", "4th intercostal space left lower sternal border"),
    MITRAL("Mitral Apex", "Heart", "5th intercostal space midclavicular line"),
    LUNG_ANTERIOR_LEFT("Left Anterior Lung", "Lung", "Upper left chest field"),
    LUNG_ANTERIOR_RIGHT("Right Anterior Lung", "Lung", "Upper right chest field"),
    LUNG_POSTERIOR_LEFT("Left Posterior Lung", "Lung", "Lower left back field"),
    LUNG_POSTERIOR_RIGHT("Right Posterior Lung", "Lung", "Lowerright back field"),
    CAROTID_BRUIT("Carotid Artery", "Vascular", "Lateral cervical area for bruit assessment")
}
