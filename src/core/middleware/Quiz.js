import { dispatch, subscribe, unsubscribe } from '../../core/helpers/EventEmitter';
import { fetchList as _fetchList,
         addQuiz as _addQuiz,
         updateQuiz as _updateQuiz,
         fetchQuestionList as _fetchQuestionList,
         addQuestion as _addQuestion,
         updateQuestion as _updateQuestion} from '../../actions/Quiz';

subscribe('quiz:fetch', (data) => fetchList(data));
subscribe('quiz:add', (data) => addQuiz(data));
subscribe('quiz:update', (data) => updateQuiz(data));

subscribe('quiz:fetch:fail', (error) => {
  dispatch('notification:throw', {
    type: 'danger',
    title: 'Quiz fetch fail',
    message: error.responseJSON.message
  });
});

subscribe('quiz:add:fail', (error) => {
  dispatch('notification:throw', {
    type: 'danger',
    title: 'Quiz add fail',
    message: error.responseJSON.message
  });
});

subscribe('quiz:update:fail', (error) => {
  dispatch('notification:throw', {
    type: 'danger',
    title: 'Quiz update fail',
    message: error.responseJSON.message
  });
});

subscribe('quiz:delete:fail', (error) => {
  dispatch('notification:throw', {
    type: 'danger',
    title: 'Quiz delete fail',
    message: error.responseJSON.message
  });
});

subscribe('quiz:question:fetch', (data) => fetchQuestionList(data));
subscribe('quiz:question:add', (data) => addQuestion(data));
subscribe('quiz:question:update', (data) => updateQuestion(data));

subscribe('quiz:question:add:fail', (error) => {
    dispatch('notification:throw', {
        type: 'danger',
        title: 'Quiz question add fail',
        message: error.responseJSON.message
    });
});

subscribe('quiz:question:update:fail', (error) => {
    dispatch('notification:throw', {
        type: 'danger',
        title: 'Quiz question update fail',
        message: error.responseJSON.message
    });
});


export function fetchList(data) {
  _fetchList(data);
};

export function addQuiz(data) {
  _addQuiz(data);
};

export function updateQuiz(data) {
  _updateQuiz(data);
};

export function fetchQuestionList(data) {
    _fetchQuestionList(data);
};

export function addQuestion(data) {
    _addQuestion(data);
}

export function updateQuestion(data) {
    _updateQuestion(data);
}
