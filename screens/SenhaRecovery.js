import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { firebase } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';

export default function EsqueciSenha() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const resetarSenha = () => {
    if (!email) {
      setMensagem('Por favor, insira um e-mail');
      setModalVisible(true);
      return;
    }

    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        setMensagem('Email para redefinição de senha enviado');
        setModalVisible(true);
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          setMensagem('E-mail não registrado');
        } else {
          setMensagem('Erro ao enviar e-mail: ' + error.message);
        }
        setModalVisible(true);
      });
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#2C2C54" />
        </TouchableOpacity>
      </View>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Esqueci Minha Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#A9A9A9"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={resetarSenha}>
          <Text style={styles.buttonText}>Resetar Senha</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal} animationIn="fadeIn" animationOut="fadeOut">
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{mensagem}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F0F0',
    paddingHorizontal: 20,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  iconButton: {
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C54',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '90%',
  },
  button: {
    backgroundColor: '#FF6A6A',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 20, // Ajuste do espaçamento
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#2C2C54',
  },
  modalButton: {
    backgroundColor: '#FF6A6A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});