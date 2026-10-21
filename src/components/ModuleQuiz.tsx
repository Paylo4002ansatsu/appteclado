import { useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { quizFor, quizIsIntroductory } from '../data/quizzes';
import { useProgress } from '../context/ProgressContext';

export function ModuleQuiz({ moduleId }: { moduleId: string }) {
  const questions = quizFor(moduleId);
  const isIntroductory = quizIsIntroductory(moduleId);
  const { saveQuiz, quizScores } = useProgress();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  if (questions.length === 0) return null;
  const question = questions[index];
  const choose = (answer: number) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === question.answer) setScore((value) => value + 1);
  };
  const next = () => {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setSelected(null);
      return;
    }
    const finalScore = score;
    saveQuiz(moduleId, finalScore);
    setDone(true);
  };
  const reset = () => { setIndex(0); setSelected(null); setScore(0); setDone(false); };

  return (
    <section className="quiz-card" id="quiz">
      <div className="quiz-heading"><div><span className="eyebrow">REVISÃO RÁPIDA</span><h2>Mini-quiz do módulo</h2><p>{isIntroductory ? 'Um quiz de orientação sobre os tópicos listados. As aulas detalhadas deste módulo virão depois.' : 'Confira o que ficou da aula. Você pode tentar novamente quando quiser.'}</p></div><span className="quiz-count">{done ? 'Concluído' : `${index + 1} / ${questions.length}`}</span></div>
      {!done ? <>
        <h3 className="quiz-question">{question.prompt}</h3>
        <div className="quiz-options">{question.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isCorrect = selected !== null && optionIndex === question.answer;
          return <button key={option} type="button" className={`quiz-option${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isSelected && !isCorrect ? ' incorrect' : ''}`} onClick={() => choose(optionIndex)} disabled={selected !== null}>
            <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{isCorrect && <Check size={17} />}{isSelected && !isCorrect && <X size={17} />}
          </button>;
        })}</div>
        {selected !== null && <div className={`quiz-feedback${selected === question.answer ? ' success' : ''}`}><strong>{selected === question.answer ? 'Isso mesmo.' : 'Quase.'}</strong> {question.explanation}</div>}
        <div className="quiz-footer"><span>{quizScores[moduleId] !== undefined ? `Sua última pontuação: ${quizScores[moduleId]} de ${questions.length}` : 'Sem pressão: o objetivo é praticar.'}</span><button type="button" className="button button-primary" disabled={selected === null} onClick={next}>{index === questions.length - 1 ? 'Ver resultado' : 'Próxima pergunta'}</button></div>
      </> : <div className="quiz-result"><div className="quiz-result-score">{score}<span>/{questions.length}</span></div><div><h3>{score === questions.length ? 'Tudo certo por aqui.' : 'Boa revisão.'}</h3><p>{isIntroductory ? 'Este é um mapa dos assuntos previstos, não uma avaliação completa do nível.' : 'Revisar em outro momento também faz parte do aprendizado.'}</p></div><button type="button" className="button button-soft" onClick={reset}><RotateCcw size={15} /> Refazer</button></div>}
    </section>
  );
}
