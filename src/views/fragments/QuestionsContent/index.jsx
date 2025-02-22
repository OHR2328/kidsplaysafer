import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useScreenSize } from "../../../hooks/useScreenSize";

import AVATARS from "../../../constants/avatars";
import ROUTE_NAMES from "../../../constants/routeNames";
import QUESTIONS from "../../../constants/questions";
import { fisherYates } from "../../../constants/questions";

import {
  QuestionsContentWrapper,
  QuestionNumber,
  StyledAvatar,
  Username,
  YourTurn,
  Question,
  Choice,
  ChoiceWrapper,
  StyledNextButton,
} from "./styled.components";
import MatchModal from "../MatchModal";

const { MAILER_FORM } = ROUTE_NAMES;

const answers = [];

const QuestionsContent = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isSmallScreen } = useScreenSize();
  const [choices, setChoices] = useState([]);
  const [step, setStep] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selected, setSelected] = useState(5);
  const [isParent, setIsParent] = useState(false);
  const [DisableNext, setDisableNext] = useState(true)
  const [showMatchModal, setShowMatchModal] = useState(false);
  const questions = QUESTIONS.slice(0, 5);
  const usernames = state.usernames,
    [childUsername, parentUsername] = usernames;
  const selections = state.selections,
    { child: childSelection, parent: parentSelection } = selections;
  const childAvatar = AVATARS.children[childSelection];
  const parentAvatar = AVATARS.parents[parentSelection];

  const handleSelect = (i) => {
    setSelected(i);
    setDisableNext(false);
  };

  const handleNext = () => {
    const index = questionNumber - 1;
    setStep((step) => step + 1);
    if (step % 2 !== 0) {
      setShowMatchModal(true);
      answers[index].parent = questions[index].answers[selected];
      answers[index].question = questions[index].question;
    } else {
      answers[index] = { child: questions[index].answers[selected] };
    }
    setSelected(5);
  };

  const handleClose = () => {
    setShowMatchModal(false);
    setQuestionNumber((questionNumber) => questionNumber + 1);
  };

  const handleEnd = () => {
    navigate(MAILER_FORM, { state: { answers }, replace: true });
  };

  useEffect(() => {
    setChoices(fisherYates(questions[questionNumber - 1].answers));
    // eslint-disable-next-line
  }, [questionNumber]);

  useEffect(() => {
    setIsParent(step % 2 !== 0);
  }, [step]);

  return (
    <>
      <Username isParent={isParent} isSmallScreen={isSmallScreen}>
        {isParent ? parentUsername : childUsername}
      </Username>
      <QuestionsContentWrapper isSmallScreen={isSmallScreen}>
        <QuestionNumber>Question {questionNumber}/5</QuestionNumber>
        <StyledAvatar src={isParent ? parentAvatar : childAvatar} />
        <YourTurn isParent={isParent}>It's your turn</YourTurn>

        <>
          <Question isSmallScreen={isSmallScreen}>
            {questions[questionNumber - 1].question}
          </Question>
          <ChoiceWrapper isSmallScreen={isSmallScreen}>
            {choices.map((choice, i) => {
              return (
                <Choice
                  key={`choice-${i}`}
                  onClick={() => handleSelect(i)}
                  isParent={isParent}
                  isSelected={selected === i}
                  isSmallScreen={isSmallScreen}
                >{`(${["A", "B", "C", "D"][i]}) ${choice}`}</Choice>
              );
            })}
          </ChoiceWrapper>
        </>
      </QuestionsContentWrapper>
      {/* TODO - refactor isParent prop on next button */}
      <div>
        {!DisableNext && (
          <StyledNextButton
          isParent={isParent}
          isSmallScreen={isSmallScreen}
          onClick={handleNext}
          disabled={DisableNext}
        />
        )
        }
      </div>
      
      {showMatchModal && (
        <MatchModal
          avatars={[childAvatar, parentAvatar]}
          handleClose={handleClose}
          handleEnd={handleEnd}
          questionNumber={questionNumber}
          question={questions[questionNumber - 1].question}
          answers={answers[questionNumber - 1]}
          choices={questions[questionNumber - 1].answers}
        />
      )}
    </>
  );
};

export default QuestionsContent;
