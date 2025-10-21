// /js/controllers/QuizUI.js

export class QuizUI {
    constructor() {
        // Modale de fin de quiz
        this.modal = document.getElementById("endQuizModal");
        this.finalScore = document.getElementById("finalScore");
        this.bestScore = document.getElementById("bestScore");
        this.restartBtn = document.getElementById("restartQuizBtn");
        this.bestScoreDisplay = document.getElementById("bestScoreDisplay");
        this.quizContainer = document.getElementById("quizContainer");

        // Quiz / start screen
        this.quizContainer = document.getElementById("quizContainer");
        this.startScreen = document.getElementById("startScreen");
        this.scoreDisplay = document.getElementById("scoreDisplay");

        // Progression
        this.currentLabel = document.getElementById("currentQuestionNumber");
        this.totalLabel = document.getElementById("totalQuestions");
        this.progressBar = document.getElementById("quizProgressBar");

        // Catégories
        this.categoryContainer = document.getElementById("quizCategory");
        this.selectedCategory = null;

        // Difficultés
        this.selectedDifficulty = null;

        // Score
        this.scoreDisplay = document.getElementById("scoreDisplay");

        // Question
        this.titleElement = document.getElementById("questionTitle");
        this.answerButtons = [
            document.getElementById("questionAnswerA"),
            document.getElementById("questionAnswerB"),
            document.getElementById("questionAnswerC"),
            document.getElementById("questionAnswerD"),
        ];

        // Boutons de navigation
        this.nextQuestionBtn = document.getElementById("nextQuestionBtn");
        this.prevQuestionBtn = document.getElementById("prevQuestionBtn");
    }

    /**
     * Affiche le start screen et cache le quiz
     */
    showStartScreen() {
        this.startScreen.classList.remove("hidden");
        this.quizContainer.classList.add("hidden");
        if (this.scoreDisplay) this.scoreDisplay.textContent = "Score: 0";
    }

    /**
     * Cache le start screen et affiche le quiz
     */
    hideStartScreen() {
        this.startScreen.classList.add("hidden");
        this.quizContainer.classList.remove("hidden");
    }

    /**
     * Affiche les boutons de sélection de difficulté
     * @param {function} onSelect - callback appelé avec la difficulté sélectionnée
     */
    showDifficultyButtons(onSelect) {
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
                input.checked = true;
                this.selectedDifficulty = null;
            }

            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.className =
                "px-6 py-2 rounded-full bg-orange-50 text-gray-700 font-medium shadow-md hover:bg-orange-300 transition-all cursor-pointer peer-checked:bg-orange-700 peer-checked:text-white";
            label.textContent = diff.label;

            input.addEventListener("change", () => {
                this.selectedDifficulty = diff.value;
                if (onSelect) onSelect(diff.value); // callback vers le controller
            });

            div.appendChild(input);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    /**
     * Affiche les catégories sous forme de boutons radio stylisés
     * @param {Array<{id: number|string, name: string}>} categories
     */
    showCategories(categories, onSelectCategory) {
        if (!this.categoryContainer || !categories) return;
        this.categoryContainer.innerHTML = "";

        categories.forEach((cat) => {
            const div = document.createElement("div");
            div.className = "inline-block";

            const input = document.createElement("input");
            input.type = "radio";
            input.id = `category-${cat.id}`;
            input.name = "category";
            input.value = cat.id;
            input.className = "hidden peer";

            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.className =
                "px-6 py-2 rounded-full bg-orange-50 text-gray-700 font-medium shadow-md hover:bg-orange-300 transition-all cursor-pointer peer-checked:bg-orange-700 peer-checked:text-white";
            label.textContent = cat.name;

            // Appelle le callback du controller quand la catégorie change
            input.addEventListener("change", () => {
                if (onSelectCategory) onSelectCategory(cat.id);
            });

            div.appendChild(input);
            div.appendChild(label);
            this.categoryContainer.appendChild(div);
        });
    }

    renderQuestion(question) {
        if (!question) return;

        this.titleElement.textContent = question.question;

        // On affiche directement les réponses dans l'ordre
        const answers = [question.correctAnswer, ...question.incorrectAnswers];

        this.answerButtons.forEach((btn, index) => {
            btn.textContent = answers[index];
            btn.dataset.answer = answers[index];

            // 🧼 Reset styles
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
                btn.classList.add("pointer-events-none", "opacity-60");
                if (btn.dataset.answer === question.correctAnswer) {
                    btn.classList.add("border-2", "border-green-500");
                }
            }
        });
    }

    /**
     * Configure les boutons de réponse
     * @param {Function} onAnswerSelected - callback à exécuter quand une réponse est choisie
     */
    setupAnswerButtons(onAnswerSelected) {
        this.answerButtons.forEach((btn) => {
            btn.onclick = () => {
                if (onAnswerSelected) {
                    onAnswerSelected(btn);
                }
            };
        });
    }

    /**
     * Met à jour le style des boutons pour afficher le feedback
     * @param {Array} answers - texte des réponses
     * @param {string} correctAnswer - réponse correcte
     * @param {string|null} selectedAnswer - réponse choisie par l'utilisateur
     */
    showAnswerFeedback(answers, correctAnswer, selectedAnswer) {
        // plus besoin de resortir answers ici, on utilise celui déjà mélangé
        this.answerButtons.forEach((btn, index) => {
            btn.textContent = answers[index];
            btn.dataset.answer = answers[index];

            btn.classList.remove(
                "bg-green-300",
                "bg-red-300",
                "text-white",
                "opacity-60",
                "pointer-events-none",
                "border-2",
                "border-green-500"
            );

            if (selectedAnswer) {
                btn.classList.add("pointer-events-none", "opacity-60");
                if (btn.dataset.answer === correctAnswer) {
                    btn.classList.add("border-2", "border-green-500");
                }
                if (btn.dataset.answer === selectedAnswer) {
                    if (selectedAnswer === correctAnswer) {
                        btn.classList.add("bg-green-300", "text-white");
                    } else {
                        btn.classList.add("bg-red-300", "text-white");
                    }
                }
            }
        });
    }

    /**
     * Configure les boutons de navigation
     * @param {Function} onNext - callback pour passer à la question suivante
     * @param {Function} onPrev - callback pour revenir à la question précédente
     */
    setupNavButtons(onNext, onPrev) {
        if (this.nextQuestionBtn) {
            this.nextQuestionBtn.onclick = () => {
                if (onNext) onNext();
            };
        }

        if (this.prevQuestionBtn) {
            this.prevQuestionBtn.onclick = () => {
                if (onPrev) onPrev();
            };
        }
    }

    /**
     * Met à jour l'affichage du score
     * @param {number} score
     */
    updateScore(score) {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Score: ${score}`;
        }
    }

    /**
     * Met à jour la barre de progression et les labels du quiz.
     * @param {number} current - Numéro de la question en cours (1-based)
     * @param {number} total - Nombre total de questions
     */
    updateProgress(current, total) {
        if (this.progressBar && this.currentLabel && this.totalLabel) {
            const percent = (current / total) * 100;
            this.progressBar.style.width = `${percent}%`;
            this.currentLabel.textContent = current;
            this.totalLabel.textContent = total;
        }
    }

    /**
     * Affiche la modale de fin de quiz avec le score final
     */
    showEndMessage(finalScore, bestScore, isNewRecord, onRestart) {
        // Texte du score final
        this.finalScore.textContent = `Final Score: ${finalScore}`;

        // Texte du meilleur score
        if (isNewRecord) {
            this.bestScore.textContent = `New best Score!`;
        } else {
            this.bestScore.textContent = `Best Score: ${bestScore}`;
        }

        // Met à jour le best score sur le start screen
        this.bestScoreDisplay.textContent = `Best Score: ${bestScore}`;

        // Affiche le modal et cache le quiz
        this.modal.classList.remove("hidden");
        this.quizContainer.classList.add("hidden");

        // Gère le bouton "Rejouer"
        this.restartBtn.onclick = () => {
            this.modal.classList.add("hidden");
            if (onRestart) onRestart(); // callback passé par le controller
        };
    }
}
