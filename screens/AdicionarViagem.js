import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';

const GEOAPIFY_API_KEY = '33105b493e6d4d80ae9f0eaa63b66ec9';

export default function AdicionarViagem() {
  const navigation = useNavigation();
  const [local, setLocal] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const handleSearchCity = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete`,
        {
          params: {
            text: query,
            type: 'city',
            lang: 'pt',
            limit: 5,
            apiKey: GEOAPIFY_API_KEY,
          },
        }
      );
      setSuggestions(response.data.features || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

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

  const handleSalvarViagem = async () => {
    if (!selectedCity.trim()) {
      Alert.alert('Erro', 'Por favor, selecione uma cidade válida.');
      return;
    }

    if (!orcamento.trim() || isNaN(orcamento.replace(/\./g, '').replace(',', '.'))) {
      Alert.alert('Erro', 'Por favor, insira um orçamento válido.');
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      await addDoc(collection(db, 'viagens'), {
        uid: user.uid,
        local: selectedCity,
        orcamento: parseFloat(
          orcamento.replace(/\./g, '').replace(',', '.')
        ),
        periodo: {
          inicio: startDate ? startDate.toISOString() : null,
          fim: endDate ? endDate.toISOString() : null,
        },
        criadaEm: new Date(),
      });

      Alert.alert('Sucesso', 'Viagem adicionada com sucesso!');
      setLocal('');
      setOrcamento('');
      setSelectedCity('');
      setStartDate(null);
      setEndDate(null);
      setSuggestions([]);
      navigation.navigate('ListaViagens');
    } catch (error) {
      console.error('Erro ao salvar a viagem:', error);
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
      <Text style={styles.title}>Busque uma cidade</Text>

      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Icon name="location-outline" size={24} color="#2C2C54" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Selecione uma cidade"
            value={local}
            onChangeText={(query) => {
              setLocal(query);
              handleSearchCity(query);
            }}
          />
        </View>
        {suggestions.length > 0 && (
          <FlatList
            style={styles.suggestionsList}
            data={suggestions}
            keyExtractor={(item) => item.properties.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setSelectedCity(item.properties.formatted);
                  setLocal(item.properties.formatted);
                  setSuggestions([]);
                }}
              >
                <Text style={styles.suggestionText}>{item.properties.formatted}</Text>
              </TouchableOpacity>
            )}
          />
        )}
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
              (valorNumerico / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })
            );
          }}
        />
      </View>

      <View style={styles.datesRow}>
        <View style={[styles.inputContainer, styles.dateContainer]}>
          <Icon name="calendar-outline" size={24} color="#2C2C54" style={styles.inputIcon} />
          <TouchableOpacity style={styles.input} onPress={() => showDatePicker('start')}>
            <Text style={styles.dateText}>
              {startDate ? startDate.toLocaleDateString('pt-BR') : 'Check-in'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.inputContainer, styles.dateContainer]}>
          <Icon name="calendar-outline" size={24} color="#2C2C54" style={styles.inputIcon} />
          <TouchableOpacity style={styles.input} onPress={() => showDatePicker('end')}>
            <Text style={styles.dateText}>
              {endDate ? endDate.toLocaleDateString('pt-BR') : 'Check-out'}
            </Text>
          </TouchableOpacity>
        </View>
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

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSalvarViagem}
      >
        <Text style={styles.saveButtonText}>Confirmar Viagem</Text>
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
  searchContainer: {
    width: '100%',
  },
  suggestionsList: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    marginTop: 5,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
  },
  suggestionText: {
    fontSize: 16,
    color: '#2C2C54',
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
    color: '#A9A9A9',
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
