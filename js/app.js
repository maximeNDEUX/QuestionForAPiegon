import { QuizController } from './controllers/QuizController.js';

/**
 * Point d'entrée de l'application
 */
class App {
    constructor() {
        this.controller = null;
    }

    /**
     * Initialise l'application
     */
    async init() {
        try {
            // Créer et initialiser le contrôleur
            this.controller = new QuizController();
            await this.controller.init();

            console.log('✅ Application initialisée avec succès !');
        } catch (error) {
            // console.error('❌ Erreur lors de l\'initialisation de l\'application:', error);
            this.showCriticalError(error);
        }
    }



    /**
     * Affiche une erreur critique dans l'élément #error
     * @param {string|Error} [message] - Message d'erreur personnalisé ou objet Error
     */
    showCriticalError(message) {
        const errorElement = document.getElementById('error');
        if (!errorElement) return;

        // Déterminer le texte à afficher
        const errorMessage =
            message instanceof Error
                ? `Une erreur critique est survenue : ${message.message}`
                : message || 'Une erreur critique est survenue. Veuillez rafraîchir la page.';

        // Injecter le message et afficher l'alerte
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');

        // Optionnel : faire défiler jusqu’à l’erreur pour plus de visibilité
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

}


// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});


