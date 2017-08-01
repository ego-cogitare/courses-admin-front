import React from 'react';

const routes = {
  // Default routes list
  default: [
    // Global (Admin) components
    {
      path: 'courses',
      component: require('../components/pages/courses/Courses.jsx').default
    },
    {
      path: 'lection/edit/:courseId(/:lectionId)',
      component: require('../components/pages/courses/LectionEdit.jsx').default
    },
    {
      path: 'lection/steps/:lectionId',
      component: require('../components/pages/lections/ManageSteps.jsx').default
    },
    {
      path: 'courses/edit/:id',
      component: require('../components/pages/courses/CourseEdit.jsx').default
    },
    {
      path: 'step/edit/:lectionId/:id',
      component: require('../components/pages/courses/StepEdit.jsx').default
    },
    {
      path: 'quiz',
      component: require('../components/pages/quiz/Quiz.jsx').default
    },
    {
      path: 'users',
      component: require('../components/pages/users/Users.jsx').default
    },
    {
      path: 'file-manager',
      component: require('../components/pages/fileManager/FileManager.jsx').default
    },
    {
      path: 'courses/stats/:id',
      component: require('../components/pages/courses/tutor/CourseStats.jsx').default
    },

    // Coordinator components
    {
      path: 'register-links/:id',
      component: require('../components/pages/courses/coordinator/RegisterLinks.jsx').default
    },

    // Tutor components
    {
      path: 'events',
      component: require('../components/pages/courses/tutor/Events.jsx').default
    },
    // ...
  ],
  // Custom route component handler depending of the user type
  custom: {
    ROLE_ADMIN: {
      available: '*'
    },
    ROLE_COORDINATOR: {
      // override: [
      //   {
      //     path: 'courses/stats/:id',
      //     component: require('../components/pages/courses/tutor/CourseStats.jsx').default
      //   }
      // ],
      available: [
        'courses/stats/:id',
        'register-links/:id'
      ]
    },
    ROLE_TUTOR: {
      // override: [
      //   {
      //     path: 'courses/stats/:id',
      //     component: require('../components/pages/courses/tutor/CourseStats.jsx').default
      //   }
      // ],
      available: [
        'courses/stats/:id',
        'events'
      ]
    },
    ROLE_USER: {
      override: [
        {
          path: 'courses',
          component: require('../components/pages/courses/CoursesUser.jsx').default
        }
      ],
      available: [
        'courses',
      ]
    },
  },


  resolve: function (route) {
    // Get logged user data
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

    // Check if route available for the user
    if (this.custom[loggedUser.role].available !== '*' && this.custom[loggedUser.role].available.indexOf(route) === -1) {
      return () => <div>Not available.</div>;
    }

    // Get custom component for the current user rolename and route path
    const customRoute = (this.custom[loggedUser.role].override || []).filter((r) => r.path === route);

    // If custom route found
    if (customRoute.length > 0) {
      return customRoute[0].component;
    }
    return this.default.filter((r) => r.path === route)[0].component;
  }
};

// Creating routes list
module.exports = routes.default.map((route) => {
  return {
    path: route.path,
    resolve: (nextState, cb) => {
      require.ensure([], (require) => {
        cb(null, routes.resolve(route.path));
      });
    }
  };
});
