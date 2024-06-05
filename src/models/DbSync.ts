import PossibleAnswer from "./PossibleAnswer";
import Question from "./Question";
import Quizz from "./Quizz";
import UserAnswer from "./UserAnswer";

export default async () => {
    await Quizz.sync();
    await Question.sync();
    await PossibleAnswer.sync();
    await UserAnswer.sync();
}