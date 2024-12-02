import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Ajuste o caminho corretamente
import Icon from 'react-native-vector-icons/Ionicons';

export default function Registro() {
  const navigation = useNavigation();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const registrarUsuario = async () => {
    if (!nomeCompleto.trim()) {
      setMensagem('Por favor, preencha o Nome Completo.');
      setModalVisible(true);
      return;
    }
    if (!celular.trim() || celular.length < 10) {
      setMensagem('Por favor, insira um número de celular válido.');
      setModalVisible(true);
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setMensagem('Por favor, insira um e-mail válido.');
      setModalVisible(true);
      return;
    }
    if (senha.length < 6) {
      setMensagem('A senha deve ter pelo menos 6 caracteres.');
      setModalVisible(true);
      return;
    }
    if (senha !== confirmacaoSenha) {
      setMensagem('As senhas não coincidem.');
      setModalVisible(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: nomeCompleto,
      });

      await addDoc(collection(db, 'usuarios'), {
        uid: user.uid,
        nomeCompleto,
        celular,
        email,
      });

      setMensagem('Usuário registrado com sucesso!');
      setModalVisible(true);
    } catch (error) {
      setMensagem('Erro ao registrar usuário: ' + error.message);
      setModalVisible(true);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);

    // Redireciona para a tela de login se o registro foi bem-sucedido
    if (mensagem === 'Usuário registrado com sucesso!') {
      navigation.navigate('Login'); // Ajuste 'Login' para o nome correto da rota de login
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#2C2C54" />
        </TouchableOpacity>
      </View>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Registro</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
        />
        <TextInput
          style={styles.input}
          placeholder="Celular"
          keyboardType="phone-pad"
          value={celular}
          onChangeText={setCelular}
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmação de Senha"
          secureTextEntry
          value={confirmacaoSenha}
          onChangeText={setConfirmacaoSenha}
        />
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={registrarUsuario}>
          <Text style={styles.buttonText}>Registrar</Text>
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
    width: '90%',
    marginTop: 20,
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
