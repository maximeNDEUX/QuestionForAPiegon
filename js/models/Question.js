// /js/models/Question.js

export class Question {
    constructor({ difficulty, category, question, correct_answer, incorrect_answers }) {
        this.difficulty = difficulty;
        this.category = category;
        this.question = question;
        this.correctAnswer = correct_answer;
        this.incorrectAnswers = incorrect_answers;
        this.answered = false;
        this.userAnswer = null;
    }
}