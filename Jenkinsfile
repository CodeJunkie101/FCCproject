// Jenkins CI pipeline (Unit 5 — DevOps: Jenkins).
// Jenkins picks up this file from the repo root and runs the stages on every
// push, so broken code is caught before it is deployed.
pipeline {
  agent any

  tools {
    nodejs 'node20' // configure a NodeJS installation named "node20" in Jenkins > Global Tool Configuration
  }

  environment {
    CI = 'true'
    // Inject a test database connection from Jenkins credentials, e.g.:
    // MONGO_URI = credentials('estatehub-mongo-uri')
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Fetching source from Git...'
        checkout scm
      }
    }

    stage('Install') {
      steps {
        echo 'Installing dependencies...'
        sh 'npm ci || npm install'
      }
    }

    stage('Verify') {
      steps {
        echo 'Running a syntax check on the server...'
        sh 'node --check server.js'
        sh 'node -e "require(\'./models/Property\'); require(\'./models/Lease\'); console.log(\'models load OK\')"'
      }
    }

    stage('Build frontend bundle') {
      steps {
        echo 'Packaging the static frontend for Tomcat deployment...'
        sh 'mkdir -p dist && cp -r public/* dist/'
      }
    }
  }

  post {
    success { echo 'Pipeline succeeded — code is ready to deploy.' }
    failure { echo 'Pipeline failed — check the stage logs above.' }
    always  { echo 'Pipeline finished.' }
  }
}
