import { QuizService } from "../services/QuizService.js";
import { Quiz } from "../models/Quiz.js";

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
    this.selectedAnswer = null;
  }

  init() {
    this.showStartScreen(); // Affiche startScreen au départ
    this.setEventsListeners();
    this.setupAnswerButtons();
  }

  setEventsListeners() {
    const startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", () => {
      this.hideStartScreen();
      this.startNewQuiz();
    });
  }

  // Affichage startScreen / quizContainer
  showStartScreen() {
    this.startScreen.classList.remove("hidden");
    this.quizContainer.classList.add("hidden");
    this.scoreDisplay.textContent = "Score: 0";
  }

  hideStartScreen() {
    this.startScreen.classList.add("hidden");
    this.quizContainer.classList.remove("hidden");
  }

  async startNewQuiz() {
    try {
      this.hideCriticalError();
      const questions = await this.service.loadQuestions(10, null, null);
      let scoreDisplay = document.getElementById("scoreDisplay");
      scoreDisplay.classList.remove("hidden");
      this.quiz = new Quiz({ questions, difficulty: "all", category: "all" });
      this.quiz.start();
      this.renderQuestion();
    } catch (error) {
      console.error(error);

      // Afficher le message d'erreur à l'utilisateur
      this.showCriticalError(error);

      // Retour à l'écran de démarrage
      this.showStartScreen();
    }
  }

  setupAnswerButtons() {
    // Écouteurs uniques pour chaque bouton
    this.answerButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!this.quiz) return;

        const selectedAnswer = btn.dataset.answer;
        const isCorrect = this.quiz.submitAnswer(selectedAnswer);

        console.log(isCorrect ? "✅ Bonne réponse !" : "❌ Mauvaise réponse !");
        this.scoreDisplay.textContent = `Score: ${this.quiz.score}`;

        if (this.quiz.nextQuestion()) {
          this.renderQuestion();
        } else {
          this.endQuiz();
        }
      });
    });
  }

  updateNavButtons() {
    const nextQuestionBtn = document.getElementById("nextQuestionBtn");
    if (nextQuestionBtn) {
      nextQuestionBtn.onclick = () => {
        if (!this.quiz) return;
        if (this.quiz.nextQuestion()) {
          this.renderQuestion();
        } else {
          this.endQuiz();
        }
      };
    }
    const prevQuestionBtn = document.getElementById("prevQuestionBtn");
    if (prevQuestionBtn) {
      prevQuestionBtn.onclick = () => {
        if (!this.quiz) return;
        this.quiz.previousQuestion();
        this.renderQuestion();
      };
    }
  }

  renderQuestion() {
    const question = this.quiz.getCurrentQuestion();
    if (!question) return;

    this.titleElement.textContent = question.question;
    const answers = [question.correctAnswer, ...question.incorrectAnswers].sort(
      () => Math.random() - 0.5
    );

    this.answerButtons.forEach((btn, index) => {
      btn.textContent = answers[index];
      btn.dataset.answer = answers[index]; // stocke la réponse pour l'écouteur
    });
    this.updateNavButtons();
  }
  endQuiz() {
    this.scoreDisplay.textContent = `Quiz completed, final score: ${this.quiz.score} / ${this.quiz.questions.length}`;

    // Cache le quiz et réaffiche startScreen après 3s
    this.quizContainer.classList.add("hidden");
    setTimeout(() => {
      let bestScoreDisplay = document.getElementById("bestScoreDisplay");
      this.scoreDisplay.classList.add("hidden");

      if (this.quiz.getScore() > this.bestScore) {
        bestScoreDisplay.innerText = `Best score: ${this.quiz.score}`;
      }
      this.showStartScreen();
    }, 3000);
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
