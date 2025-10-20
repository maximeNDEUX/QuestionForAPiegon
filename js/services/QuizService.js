/**
* Charge les questions depuis l'API OpenTDB
*/

import { Question } from "../models/Question.js";

import { decodeHTML } from "../utils/stringify.js";

export class QuizService {
    constructor(){
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
    }



    /**
     * Charge les questions depuis l'API OpenTDB
     * @param {number} amount
     * @param {number|null} category
     * @param {string|null} difficulty
     * @returns {Question[]} Tableau d'instances Question
     */
    async loadQuestions(amount = 10, category = null, difficulty = null) {
        try {
            let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
            if (category) url += `&category=${category}`;
            if (difficulty) url += `&difficulty=${difficulty}`;

            console.log(url);

            const response = await fetch(url);
            const data = await response.json();

            // Gestion spécifique du rate-limit
            if (response.status === 429) {
                throw new Error("Too many requests. Please wait a moment and try again.");
            }

            if (!response.ok) {
                throw new Error(`Network error: ${response.status} ${response.statusText}`);
            }

            // Transforme les données brutes en objets Question
            const questions = data.results.map(q => new Question({
                difficulty: q.difficulty,
                question: decodeHTML(q.question),
                correct_answer: decodeHTML(q.correct_answer),
                incorrect_answers: q.incorrect_answers.map(ans => decodeHTML(ans))
            }));
            return questions;

        } catch (error) {
            console.error('❌ Erreur dans QuizService.loadQuestions:', error);
            throw error;
        }
    }



    // Charger les catégories de questions
    async loadCategories() {
        try {
            const response = await fetch('https://opentdb.com/api_category.php');
            const data = await response.json();
            return data.trivia_categories;
        } catch (error) {
            console.error('❌ Erreur dans QuizModel.loadCategories:', error);
            throw error;
        }
    }
}
















