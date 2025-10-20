// models/Quiz.js

import { Question } from "./Question.js";

export class Quiz {
    constructor({ questions = [], difficulty = "all", category = "all" }) {
        this.questions = questions; // Tableau d'objets Question
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isActive = false;
        this.difficulty = difficulty;
        this.category = category;
    }

    /**
     * Lance le quiz
     */
    start() {
        this.isActive = true;
        this.currentQuestionIndex = 0;
        this.score = 0;
    }

    /**
     * Retourne la question courante
     * @returns {Question}
     */
    getCurrentQuestion() {
        console.log(`getCurrentQuestion ${this.questions[this.currentQuestionIndex]}`)
        return this.questions[this.currentQuestionIndex];
    }

    /** Passe à la question suivante */
    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            return true;
        }
        return false;
    }

    /** Revient à la question précédente */
    previousQuestion() {
        if (this.currentIndex > 0) this.currentIndex--;
    }

    /**
     * Vérifie la réponse donnée et met à jour le score
     * @param {string} answer - Réponse choisie par l'utilisateur
     * @returns {boolean} - true si la réponse est correcte
     */
    submitAnswer(answer) {
        const current = this.getCurrentQuestion();
        const isCorrect = current.correctAnswer === answer;

        if (isCorrect) this.incrementScore();
        return isCorrect;
    }


    incrementScore() {
        this.score++;
    }

    getScore() {
        return this.score;
    }


    /**
     * Passe à la question suivante
     * @returns {boolean} - true si passage réussi, false si fin du quiz
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }

    /**
     * Revient à la question précédente
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
        }
    }

    /**
     * Indique si le quiz est terminé
     * @returns {boolean}
     */
    isQuizOver() {
        return this.currentQuestionIndex >= this.questions.length - 1;
    }

    /**
     * Réinitialise le quiz
     */
    reset() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isActive = false;
    }
}
