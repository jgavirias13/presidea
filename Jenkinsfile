pipeline{
    agent any
    tools {nodejs "node"}

    stages{
        stage('Cloning Git'){
            steps{
                git 'https://github.com/jgavirias13/presidea'
            }
        }
        stage('Install dependencies'){
            steps{
                sh 'npm install'
            }
        }
        stage('Test'){
            steps{
                sh 'npm test'
            }
        }
    }
}