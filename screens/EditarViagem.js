import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function EditarViagem() {
  const navigation = useNavigation();
  const route = useRoute();
  const viagem = route.params?.viagem || null;

  const [local, setLocal] = useState(viagem?.local || '');
  const [orcamento, setOrcamento] = useState(
    viagem
      ? parseFloat(viagem.orcamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      : ''
  );
  const [startDate, setStartDate] = useState(viagem?.periodo?.inicio ? new Date(viagem.periodo.inicio) : null);
  const [endDate, setEndDate] = useState(viagem?.periodo?.fim ? new Date(viagem.periodo.fim) : null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState(null);

  useEffect(() => {
    if (!viagem) {
      setStartDate(new Date());
      setEndDate(new Date());
    }
  }, [viagem]);

  const showDatePicker = (type) => {
    setPickerType(type);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
    setPickerType(null);
  };

  const handleDateConfirm = (date) => {
    if (pickerType === 'start') {
      setStartDate(date);
    } else if (pickerType === 'end') {
      if (date < startDate) {
        Alert.alert('Erro', 'A data de check-out não pode ser antes do check-in.');
        hideDatePicker();
        return;
      }
      setEndDate(date);
    }
    hideDatePicker();
  };

  const handleSalvar = async () => {
    if (!local.trim()) {
      Alert.alert('Erro', 'Por favor, insira um local válido.');
      return;
    }

    if (!orcamento.trim() || isNaN(orcamento.replace(/\./g, '').replace(',', '.'))) {
      Alert.alert('Erro', 'Por favor, insira um orçamento válido.');
      return;
    }

    try {
      const orcamentoFormatado = parseFloat(orcamento.replace(/\./g, '').replace(',', '.'));
      const periodo = {
        inicio: startDate.toISOString(),
        fim: endDate.toISOString(),
      };

      if (viagem) {
        const viagemRef = doc(db, 'viagens', viagem.id);
        await updateDoc(viagemRef, { local, orcamento: orcamentoFormatado, periodo });
        Alert.alert('Sucesso', 'Viagem atualizada com sucesso!');
      } else {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Erro', 'Usuário não autenticado.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          return;
        }
        await addDoc(collection(db, 'viagens'), {
          uid: user.uid,
          local,
          orcamento: orcamentoFormatado,
          periodo,
          criadaEm: new Date(),
        });
        Alert.alert('Sucesso', 'Nova viagem criada com sucesso!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar viagem:', error);
      Alert.alert('Erro', 'Não foi possível salvar a viagem.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#2C2C54" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{viagem ? 'Editar Viagem' : 'Nova Viagem'}</Text>

      {/* Campo de cidade */}
      <View style={styles.inputContainer}>
        <Icon name="location-outline" size={24} color="#2C2C54" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, viagem ? { color: '#A9A9A9' } : null]}
          value={local}
          onChangeText={setLocal}
          editable={!viagem}
          placeholder="Local"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>R$</Text>
        <TextInput
          style={styles.input}
          placeholder="Orçamento"
          keyboardType="numeric"
          value={orcamento}
          onChangeText={(valor) => {
            const valorNumerico = valor.replace(/[^0-9]/g, '');
            setOrcamento(
              (valorNumerico / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            );
          }}
        />
      </View>

      <View style={styles.datesRow}>
        <TouchableOpacity style={[styles.inputContainer, styles.dateContainer]} onPress={() => showDatePicker('start')}>
          <Icon name="calendar-outline" size={24} color="#2C2C54" style={styles.inputIcon} />
          <Text style={styles.dateText}>
            {startDate ? startDate.toLocaleDateString('pt-BR') : 'Check-in'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.inputContainer, styles.dateContainer]} onPress={() => showDatePicker('end')}>
          <Icon name="calendar-outline" size={24} color="#2C2C54" style={styles.inputIcon} />
          <Text style={styles.dateText}>
            {endDate ? endDate.toLocaleDateString('pt-BR') : 'Check-out'}
          </Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        display="spinner"
        locale="pt-BR"
        textColor="#2C2C54"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 50,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C54',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 10,
    height: 40,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  dateContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C54',
  },
  dateText: {
    fontSize: 16,
    color: '#2C2C54',
  },
  currencySymbol: {
    fontSize: 18,
    color: '#2C2C54',
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#FF6A6A',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
