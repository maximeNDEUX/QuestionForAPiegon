// /js/controllers/QuizController.js

import { QuizService } from "../services/QuizService.js";
import { Quiz } from "../models/Quiz.js";
import { QuizUI } from "../controllers/QuizUI.js";

export class QuizController {
    constructor() {
        this.service = new QuizService();

        this.quiz = null;
        this.bestScore = 0;
        this.titleElement = document.getElementById("questionTitle");
        this.scoreDisplay = document.getElementById("scoreDisplay");
        this.quizContainer = document.getElementById("quizContainer");
        this.startScreen = document.getElementById("startScreen");
        this.answerButtons = [
            document.getElementById("questionAnswerA"),
            document.getElementById("questionAnswerB"),
            document.getElementById("questionAnswerC"),
            document.getElementById("questionAnswerD"),
        ];

        this.quizUI = new QuizUI();

        this.selectedAnswer = null;
        this.categories = [];
        this.selectedCategory = null;
        this.selectedDifficulty = null;
        this.questionCount = 10;
    }

    async init() {
        this.quizUI.showStartScreen();

        await this.getCategories();

        this.quizUI.showCategories(this.categories, (selectedId) => {
            this.selectedCategory = selectedId;
        });

        this.quizUI.showDifficultyButtons((selectedDiff) => {
            this.selectedDifficulty = selectedDiff;
        });

        this.setEventsListeners();
        this.setupAnswerButtons();
    }

    setEventsListeners() {
        const startBtn = document.getElementById("startBtn");
        startBtn.addEventListener("click", () => {
            this.quizUI.hideStartScreen();
            this.startNewQuiz();
        });

        // TODO: Confier ceci dans la vue
        // --- Slider number of questions ---
        const questionCountInput = document.getElementById("questionCount");
        const questionCountLabel =
            document.getElementById("questionCountLabel");

        if (questionCountInput && questionCountLabel) {
            // Initialisation
            this.questionCount = parseInt(questionCountInput.value, 10);
            questionCountLabel.textContent = this.questionCount;

            // Écouteur pour chaque mouvement du slider
            questionCountInput.addEventListener("input", (event) => {
                this.questionCount = parseInt(event.target.value, 10);
                questionCountLabel.textContent = this.questionCount;
            });
        }
    }

    async startNewQuiz() {
        try {
            // TODO: Mettre dans le contrôleur de vue
            this.hideCriticalError();

            const questions = await this.service.loadQuestions(
                this.questionCount,
                this.selectedCategory,
                this.selectedDifficulty
            );

            this.quiz = new Quiz({
                questions,
                difficulty: "all",
                category: "all",
            });
            this.quiz.start();
            this.renderQuestion();
        } catch (error) {
            console.error(error);

            // Afficher le message d'erreur à l'utilisateur
            this.showCriticalError(error);

            // Retour à l'écran de démarrage
            this.quizUI.showStartScreen();
        }
    }

    async getCategories() {
        this.categories = await this.service.loadCategories();
    }

    setupAnswerButtons() {
        this.quizUI.setupAnswerButtons((btn) => {
            if (!this.quiz) return;

            const question = this.quiz.getCurrentQuestion();
            if (question.answered) return; // déjà répondu

            const selectedAnswer = btn.dataset.answer;
            question.answered = true;

            // --- Incrémentation du score si bonne réponse ---
            if (selectedAnswer === question.correctAnswer) {
                this.quiz.score += 1;
            }

            // Met à jour le score
            this.quizUI.updateScore(this.quiz.score);

            // Affiche le feedback via la vue
            const answers = [
                question.correctAnswer,
                ...question.incorrectAnswers,
            ];

            this.quizUI.showAnswerFeedback(
                answers,
                question.correctAnswer,
                selectedAnswer
            );
            // Passe à la suivante après un délai
            setTimeout(() => {
                if (this.quiz.nextQuestion()) {
                    this.renderQuestion();
                } else {
                    this.endQuiz();
                }
            }, 1200);
        });
    }

    /**
     * 	Met à jour la question courante
     */
    renderQuestion() {
        const question = this.quiz.getCurrentQuestion();
        if (!question) return;

        this.quizUI.renderQuestion(question);

        this.updateNavButtons();
        this.updateProgress();
    }

    /**
     * 	Met à jour les boutons de navigation
     */
    updateNavButtons() {
        this.quizUI.setupNavButtons(
            () => {
                // next
                if (!this.quiz) return;
                if (this.quiz.nextQuestion()) {
                    this.renderQuestion();
                } else {
                    this.endQuiz();
                }
            },
            () => {
                // prev
                if (!this.quiz) return;
                this.quiz.previousQuestion();
                this.renderQuestion();
            }
        );
    }

    /**
     * 	Met à jour la barre de progression et les labels du quiz
     */
    updateProgress() {
        if (!this.quiz) return;

        const current = this.quiz.currentQuestionIndex + 1; // +1 car index commence à 0
        const total = this.quiz.questions.length;

        // On délègue la mise à jour à la vue
        this.quizUI.updateProgress(current, total);
    }

    /**
     * 	Termine le quiz en calculant le score final et en mettant à jour le meilleur score.
     */
    endQuiz() {
        const finalScore = `${this.quiz.score} / ${this.quiz.questions.length}`;
        const isNewRecord = this.quiz.getScore() > this.bestScore;

        if (isNewRecord) {
            this.bestScore = this.quiz.getScore();
        }

        this.quizUI.showEndMessage(
            finalScore,
            this.bestScore,
            isNewRecord,
            () => this.quizUI.showStartScreen() // callback
        );
    }

    /**
     * Affiche une erreur critique dans l'élément #error
     * @param {string|Error} [message] - Message d'erreur personnalisé ou objet Error
     */
    showCriticalError(message) {
        const errorElement = document.getElementById("error");
        if (!errorElement) return;

        // Toujours retirer la classe hidden avant d'afficher
        errorElement.classList.remove("hidden");

        // Déterminer le texte à afficher
        const errorMessage =
            message instanceof Error
                ? `Error: ${message.message}`
                : message || "Critical Error. Please refresh";

        // Injecter le message
        errorElement.textContent = errorMessage;

        // Faire défiler jusqu’à l’erreur pour plus de visibilité
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    /**
     * Cache l'erreur critique et réactive le contenu
     */
    hideCriticalError() {
        const errorElement = document.getElementById("error");
        if (!errorElement) return;

        errorElement.classList.add("hidden");
        errorElement.textContent = ""; // on vide le message précédent
    }
}
