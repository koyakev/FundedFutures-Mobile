import React, {useState, useEffect} from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, StatusBar} from'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import {getDocs, collection, query, where, orderBy} from 'firebase/firestore';
import {db} from '../firebase/dbConnection';

export default function Dashboard({ navigation, route }) {
    const { id } = route.params;
    const [logs, setLogs] = useState();

    useEffect(() => {
        const fetch = async() => {
            try {

                const logsDoc = await getDocs(query(collection(db, 'logs'), where('userId', '==', id), orderBy('timestamp', 'desc')));
                setLogs(logsDoc.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })));
                console.log(logs);
            } catch (error) {
                console.error('Error fetching documents: ', error);
            }
        }

        fetch();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4D4D4D" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                >
                    <AntDesign name="arrowleft" size={30} color="#F7D66A" />
                </TouchableOpacity>
                <Text style={styles.headerText}>History</Text>
            </View>
            <ScrollView style={styles.content}>
                {logs ? (
                    logs.map((log) => (
                        <View key={log.id} style={styles.log}>
                            <Text style={styles.activity}>{log.activity}</Text>
                            <Text>{log.timestamp.toDate().toLocaleString()}</Text>
                        </View>
                    ))
                ) : (
                    <Text>None</Text>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4D4D4D',
    },
    header: {
        flexDirection: 'row',
        marginHorizontal: 10,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 30,
        color: '#F7D66A',
        marginLeft: 20
    },
    content: {
        backgroundColor: '#FADEAD',
        margin: 20,
        padding: 15,
        borderRadius: 20,
    },
    log: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: '#4D4D4D',
        borderRadius: 10,
    },
    activity: {
        fontWeight: 'bold',
        fontSize: 16,
    }
})