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
    this.startScreen = document.getElementById("startScreen");    this.answerButtons = [
      document.getElementById("questionAnswerA"),
      document.getElementById("questionAnswerB"),
      document.getElementById("questionAnswerC"),
      document.getElementById("questionAnswerD"),
    ];
    this.selectedAnswer = null;
    this.categories = [];
    this.selectedCategory = null;
    this.selectedDifficulty = null;
    this.questionCount = 10;

  }
  

  async init() {
    this.showStartScreen();
    await this.getCategories();
    this.showCategories(this.categories);
    this.showDifficultyButtons();
    this.setEventsListeners();
    this.setupAnswerButtons();
  }

  setEventsListeners() {
    const startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", () => {
      this.hideStartScreen();
      this.startNewQuiz();
    });

    // --- Slider number of questions ---
    const questionCountInput = document.getElementById("questionCount");
    const questionCountLabel = document.getElementById("questionCountLabel");

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
      const questions = await this.service.loadQuestions(this.questionCount ,this.selectedCategory , this.selectedDifficulty);
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

  async getCategories() {
    this.categories = await this.service.loadCategories();
  }

  showCategories(categories) {
    const categoryContainer = document.getElementById("quizCategory");
    categoryContainer.innerHTML = "";

    if (!categories) return;

    categories.forEach((cat) => {
      // Crée un conteneur pour chaque option
      const div = document.createElement("div");
      div.className = "inline-block"; // optionnel, pour bien aligner les boutons

      // Crée l'input radio
      const input = document.createElement("input");
      input.type = "radio";
      input.id = `category-${cat.id}`;
      input.name = "category"; // même nom pour n’en sélectionner qu’un seul
      input.value = cat.id;
      input.className = "hidden peer";

      // Crée le label stylisé
      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.className =
        "px-6 py-2 rounded-full bg-orange-50 text-gray-700 font-medium shadow-md hover:bg-orange-300 transition-all cursor-pointer peer-checked:bg-orange-700 peer-checked:text-white";
      label.textContent = cat.name;

      // Event pour définir la catégorie choisie
      input.addEventListener("change", () => {
        this.selectedCategory = input.value;
      });

      // Assemble
      div.appendChild(input);
      div.appendChild(label);
      categoryContainer.appendChild(div);
    });
  }

  showDifficultyButtons() {
    const difficulties = [
      { value: null, label: "All" },
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ];

    const container = document.getElementById("difficultyPicker");
    container.innerHTML = "";

    difficulties.forEach((diff, index) => {
      const div = document.createElement("div");
      div.className = "inline-block";

      const input = document.createElement("input");
      input.type = "radio";
      input.id = `difficulty-${diff.value}`;
      input.name = "difficulty";
      input.value = diff.value;
      input.className = "hidden peer";
      if (index === 0) {
        input.checked = true; // par défaut : "All"
        this.selectedDifficulty = null;
      }

      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.className =
        "px-6 py-2 rounded-full bg-orange-50 text-gray-700 font-medium shadow-md hover:bg-orange-300 transition-all cursor-pointer peer-checked:bg-orange-700 peer-checked:text-white";
      label.textContent = diff.label;

      // Quand on clique sur un bouton radio → mettre à jour la difficulté
      input.addEventListener("change", () => {
        this.selectedDifficulty = diff.value;
      });

      div.appendChild(input);
      div.appendChild(label);
      container.appendChild(div);
    });
  }




 setupAnswerButtons() {
  this.answerButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!this.quiz) return;

      const question = this.quiz.getCurrentQuestion();

      // 🔒 Si déjà répondu, ignorer le clic
      if (question.answered) {
        console.log("⚠️ Question déjà répondue, clic ignoré.");
        return;
      }

      const selectedAnswer = btn.dataset.answer;
      const isCorrect = this.quiz.submitAnswer(selectedAnswer);

      // Marquer la question comme répondue
      question.answered = true;

      // 🎨 Feedback visuel
      if (isCorrect) {
        btn.classList.add("bg-green-300", "text-white");
      } else {
        btn.classList.add("bg-red-300", "text-white");
      }

      // 🔒 Désactive tous les boutons pour cette question
      this.answerButtons.forEach((b) => {
        b.classList.add("pointer-events-none", "opacity-60");

        // 🔹 Montre la bonne réponse
        if (b.dataset.answer === question.correctAnswer) {
          b.classList.add("border-2", "border-green-500");
        }
      });

      // 🧮 Met à jour le score
      this.scoreDisplay.textContent = `Score: ${this.quiz.score}`;

      // ⏳ Attends un peu avant de passer à la suivante
      setTimeout(() => {
        if (this.quiz.nextQuestion()) {
          this.renderQuestion();
        } else {
          this.endQuiz();
        }
      }, 1200);
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

    console.log("appel de renderQuestion()")

    const question = this.quiz.getCurrentQuestion();
    if (!question) return;

    console.log("Question courante:", question);

    this.titleElement.textContent = question.question;
    const answers = [question.correctAnswer, ...question.incorrectAnswers].sort(
      () => Math.random() - 0.5
    );


    this.answerButtons.forEach((btn, index) => {
    btn.textContent = answers[index];
    btn.dataset.answer = answers[index];

    // 🧼 Reset du style visuel
      
      btn.classList.remove(
      "bg-green-300",
      "bg-red-300",
      "text-white",
      "opacity-60",
      "pointer-events-none",
      "border-2",
      "border-green-500"
    );
      if (question.answered) {
        // Si déjà répondu, désactiver les boutons
        btn.classList.add("pointer-events-none", "opacity-60");
        this.answerButtons.forEach((b) => {
          // Montrer la bonne réponse
          if (b.dataset.answer === question.correctAnswer) {
            b.classList.add("border-2", "border-green-500");
          }
        });
      }
      
   
  });
    this.updateNavButtons();
    this.updateProgress();
  }
  


  updateProgress() {
  if (!this.quiz) return;

  const currentLabel = document.getElementById("currentQuestionNumber");
  const totalLabel = document.getElementById("totalQuestions");
  const progressBar = document.getElementById("quizProgressBar");

  if (progressBar && currentLabel && totalLabel) {
    // +1 car currentQuestionIndex commence à 0
    const current = this.quiz.currentQuestionIndex + 1;
    const total = this.quiz.questions.length;
    const percent = (current / total) * 100;

    progressBar.style.width = `${percent}%`;

    currentLabel.textContent = current;
    totalLabel.textContent = total;
  }
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
